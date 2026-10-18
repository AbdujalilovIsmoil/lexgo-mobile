import { useState } from "react";
import { analyzeFile, analyzeText, FILE_EXT, FILE_TYPES, MAX_FILE_MB, type DocAnalysis, type PickedDoc } from "@/entities/doc-analysis";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { pickDocuments } from "@/shared/lib/upload";
import { useOptions } from "./useOptions";
import { useQuote } from "./useQuote";

type Status = "idle" | "running" | "done" | "error";
const MIN_TEXT = 20;

// State machine of the analysis screen: pick a file (or paste text) → run → result.
export function useDocAnalysis() {
  const { t } = useT();
  const [file, setFile] = useState<PickedDoc | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DocAnalysis | null>(null);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const opts = useOptions(text);
  const quote = useQuote(opts.input);
  const canRun = status !== "running" && (!!file || text.trim().length >= MIN_TEXT) && opts.pagesOk;

  const pick = async () => {
    const r = await pickDocuments({ types: FILE_TYPES, exts: FILE_EXT, maxMb: MAX_FILE_MB });
    if (!r) return;
    setError(r.error === "tooBig" ? t("docs.tooBig", { mb: MAX_FILE_MB }) : r.error ? t("docs.badType") : "");
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
      const status = e instanceof ApiError ? e.status : 0;
      if (status === 402) setPlan(e instanceof ApiError ? e.detail ?? "" : "");
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

  return { opts, quote, file, setFile, text, setText, status, result, error, canRun, plan, closePlan: () => setPlan(null), pick, run, reset, addReview, minText: MIN_TEXT };
}
