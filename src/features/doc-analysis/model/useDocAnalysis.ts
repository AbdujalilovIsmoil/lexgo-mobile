import { useMemo, useState } from "react";
import { analyzeFile, analyzeText, FILE_RULE, type DocAnalysis, type PickedDoc } from "@/entities/doc-analysis";
import { pickRule, useDocRefusal, useDocSettings } from "@/entities/doc-settings";
import { planGateOf, type PlanGate } from "@/entities/plan";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { pickDocuments } from "@/shared/lib/upload";
import { INCLUDED_PAGES, useOptions } from "./useOptions";
import { useQuote } from "./useQuote";

type Status = "idle" | "running" | "done" | "error";
const MIN_TEXT = 20;

// State machine of the analysis screen: pick a file (or paste text) → run → result. The file's formats and size, the pages the base
// price covers and whether the analysis (and the advocate review) is open come from the document service settings (TZ.md §4).
export function useDocAnalysis() {
  const { t } = useT();
  const ds = useDocSettings();
  const refusal = useDocRefusal();
  const rule = useMemo(() => pickRule(ds.upload(FILE_RULE)), [ds]);
  const gate = ds.gate("analysis");
  const review = ds.gate("review").state !== "off";
  const [file, setFile] = useState<PickedDoc | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DocAnalysis | null>(null);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanGate | null>(null);
  const opts = useOptions(text, { included: ds.includedPages(INCLUDED_PAGES), review });
  const quote = useQuote(opts.input);
  const canRun = gate.state === "open" && status !== "running" && (!!file || text.trim().length >= MIN_TEXT) && opts.pagesOk;

  const pick = async () => {
    const r = await pickDocuments({ types: rule.types, exts: rule.exts, maxMb: rule.maxMb });
    if (!r) return;
    setError(r.error === "tooBig" ? t("docs.tooBig", { mb: rule.maxMb }) : r.error ? t("dset.badType", { types: rule.label }) : "");
    if (r.files[0]) setFile(r.files[0]);
  };

  const run = async () => {
    if (!canRun) return;
    setStatus("running");
    setError("");
    try {
      if (!quote.fresh) await quote.get();
      setResult(file ? await analyzeFile(file) : await analyzeText(text.trim()));
      setStatus("done");
      successHaptic();
    } catch (e) {
      errorHaptic();
      setStatus("error");
      const refused = refusal(e);
      const status = e instanceof ApiError ? e.status : 0;
      // The plan's grounds (a 402, the document service's plan codes among them) open the plan sheet; any other document service
      // refusal is said in words.
      const pg = planGateOf(e);
      if (pg) setPlan(pg);
      else if (refused) setError(refused);
      else if (file && [413, 415, 422].includes(status)) setError((e as ApiError).detail ?? t("docs.unreadable"));
      else setError(status === 0 ? t("common.offline") : status === 429 ? t("common.rateLimited") : t("docs.failed"));
    }
  };

  // "Advokat tekshiruvini qo'shish": tick the option and re-price at once.
  const addReview = () => {
    opts.setLawyerReview(true);
    void quote.get({ ...opts.input, lawyerReview: true });
  };

  const reset = () => {
    setFile(null);
    setText("");
    setResult(null);
    setStatus("idle");
    setError("");
  };

  return { opts, quote, file, setFile, text, setText, status, result, error, canRun, plan, closePlan: () => setPlan(null), pick, run, reset, addReview, minText: MIN_TEXT, rule, gate };
}
