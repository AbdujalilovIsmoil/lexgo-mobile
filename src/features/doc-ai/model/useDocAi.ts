import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  classify, draftKey, generateAiDoc, getAiQuestions, toWire, useDraftSync, useSectionWizard,
  type Draft, type DocAnswers, type DocSection, type GeneratedDoc,
} from "@/entities/doc-form";
import type { PlanGate } from "@/entities/plan";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";

type Args = { serviceId: string; userId: string; draft?: Draft };
const MIN_NEED = 10;

// AI-assisted document (TZ 13): need → dynamic questions → server generation from
// the original template. The questions are only rendered; the AI completes the rest.
export function useDocAi({ serviceId, userId, draft }: Args) {
  const { t, locale } = useT();
  const qc = useQueryClient();
  const [need, setNeed] = useState(draft?.need ?? "");
  const [extra, setExtra] = useState("");
  const [language, setLanguage] = useState(locale === "ru" ? "ru" : "uz-latn");
  const [answers, setAnswers] = useState<DocAnswers>(draft?.answers ?? {});
  const [sections, setSections] = useState<DocSection[] | null>(null);
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);
  const [plan, setPlan] = useState<PlanGate | null>(null);
  const wiz = useSectionWizard(sections ?? [], answers, { strict: false });
  const sync = useDraftSync(draftKey(userId, "ai", serviceId), { answers, step: 0, need });
  const wire = useMemo(() => toWire((sections ?? []).flatMap((s) => s.fields), answers), [sections, answers]);

  const fail = (e: unknown, fallback: string) => {
    errorHaptic();
    const f = classify(e);
    if (f.gate) setPlan(f.gate);
    else toast(f.kind === "network" ? t("common.offline") : f.kind === "busy" ? t("common.rateLimited") : f.message || t(fallback), "err");
  };
  const questions = useMutation({
    mutationFn: () => getAiQuestions(serviceId, need.trim(), language, t("dc5.extraSection")),
    onSuccess: (r) => setSections(r.sections),
    onError: (e) => fail(e, "dc5.questionsFailed"),
  });
  const generate = useMutation({
    mutationFn: () => generateAiDoc(serviceId, { need: need.trim(), answers: wire, language, extra: extra.trim() || undefined }),
    onSuccess: (d) => {
      sync.finish();
      setDoc(d);
      successHaptic();
      void qc.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e) => fail(e, "dc5.generateFailed"),
  });

  return {
    need, setNeed, extra, setExtra, language, setLanguage, answers, sections, wiz, doc, plan, questions, generate,
    set: (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v })),
    needOk: need.trim().length >= MIN_NEED,
    backToNeed: () => setSections(null),
    closePlan: () => setPlan(null),
  };
}
