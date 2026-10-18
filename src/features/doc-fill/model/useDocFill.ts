import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  classify, draftKey, generateDoc, missingFromError, toWire, useDraftSync, useSectionWizard,
  type Draft, type DocAnswers, type DocSchema, type GeneratedDoc,
} from "@/entities/doc-form";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";

type Args = { serviceId: string; userId: string; schema: DocSchema; draft?: Draft };

// Manual fill (TZ 12): section wizard + local draft + server preview / generate.
export function useDocFill({ serviceId, userId, schema, draft }: Args) {
  const { t } = useT();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<DocAnswers>(draft?.answers ?? {});
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const wiz = useSectionWizard(schema.sections, answers, { strict: true, initial: draft?.step });
  const sync = useDraftSync(draftKey(userId, "manual", serviceId), { answers, step: wiz.step });
  const fields = useMemo(() => schema.sections.flatMap((s) => s.fields), [schema]);
  const wire = useMemo(() => toWire(fields, answers), [fields, answers]);

  const gen = useMutation({
    mutationFn: () => generateDoc(serviceId, wire),
    onSuccess: (d) => {
      sync.finish();
      setDoc(d);
      successHaptic();
      void qc.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e) => {
      errorHaptic();
      const f = classify(e);
      const missing = missingFromError(e);
      if (f.kind === "plan") setPlan(f.message);
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
  return { answers, set, wiz, wire, doc, gen, plan, closePlan: () => setPlan(null), clear };
}
