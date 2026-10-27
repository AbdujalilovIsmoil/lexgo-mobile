import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Autosaver, classify, draftKey, missingFromError, toWire, useDraftSync, useSectionWizard,
  type Draft, type DocAnswers, type DocSchema, type FillSource, type GeneratedDoc, type SaveState,
} from "@/entities/doc-form";
import { useDocRefusal } from "@/entities/doc-settings";
import type { PlanGate } from "@/entities/plan";
import { trackDoc } from "@/shared/analytics";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";

type Args = { source: FillSource; userId: string; schema: DocSchema; draft?: Draft; initialDoc?: GeneratedDoc | null };

// Manual fill (TZ 12): section wizard + local draft + server preview / generate. The source says where the preview and the file come from
// (a service, or a template's document request); a request source also gets the server autosave of the answers (Saving / Saved / Retry).
// A generate the document service refuses (TZ.md §4) says why in plain words.
export function useDocFill({ source, userId, schema, draft, initialDoc }: Args) {
  const { t } = useT();
  const refusal = useDocRefusal();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<DocAnswers>(draft?.answers ?? {});
  const [doc, setDoc] = useState<GeneratedDoc | null>(initialDoc ?? null);
  const [plan, setPlan] = useState<PlanGate | null>(null);
  const wiz = useSectionWizard(schema.sections, answers, { strict: true, initial: draft?.step });
  const sync = useDraftSync(draftKey(userId, source.draftMode, source.draftId), { answers, step: wiz.step, requestId: source.requestId });
  const fields = useMemo(() => schema.sections.flatMap((s) => s.fields), [schema]);
  const wire = useMemo(() => toWire(fields, answers), [fields, answers]);

  // Server autosave of the full answers: one save at a time, ~800 ms after the last change, once more on leaving and when the app is backgrounded.
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saver] = useState(() => {
    const save = source.save;
    if (!save) return null;
    const s = new Autosaver((json) => save(JSON.parse(json) as Record<string, string>), (st) => {
      setSaveState(st);
      if (st === "saved" && source.meta) trackDoc("document_constructor_saved", { ...source.meta, mode: "self" });
    });
    s.baseline(JSON.stringify(source.serverWire ?? {}));
    return s;
  });
  const json = JSON.stringify(wire);
  useEffect(() => { saver?.push(json); }, [saver, json]);
  useEffect(() => () => void saver?.flush(), [saver]);
  useEffect(() => {
    if (!saver) return;
    const sub = AppState.addEventListener("change", (s) => { if (s !== "active") void saver.flush(); });
    return () => sub.remove();
  }, [saver]);

  const gen = useMutation({
    mutationFn: () => {
      if (source.meta) trackDoc("document_generation_requested", { ...source.meta, mode: "self" });
      return source.generate(wire);
    },
    onSuccess: (d) => {
      saver?.stop(); // the document exists: nothing may write to the request after it
      sync.finish();
      setDoc(d);
      successHaptic();
      void qc.invalidateQueries({ queryKey: ["documents"] });
      void qc.invalidateQueries({ queryKey: ["my-docs"] });
    },
    onError: (e) => {
      errorHaptic();
      const f = classify(e);
      const missing = missingFromError(e);
      const refused = refusal(e);
      if (f.gate) setPlan(f.gate);
      else if (refused) toast(refused, "err");
      else if (missing.length) {
        const at = schema.sections.findIndex((s) => s.fields.some((x) => x.key === missing[0].key));
        if (at >= 0) wiz.jump(at);
        toast(t("dc2.serverMissing", { n: missing.length }), "err");
      } else toast(f.message || t(f.kind === "network" ? "common.offline" : "dc2.generateFailed"), "err");
    },
  });

  const set = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));
  const clear = () => {
    setAnswers({});
    wiz.go(0);
  };
  return { answers, set, wiz, wire, doc, gen, plan, closePlan: () => setPlan(null), clear, saveState, retrySave: () => void saver?.retry() };
}
