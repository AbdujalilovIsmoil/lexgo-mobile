import { useState } from "react";
import { errorHaptic } from "@/shared/lib/haptics";
import { validateField, type FieldError } from "../lib/validate";
import type { DocAnswers, DocField, DocSection } from "./types";

export type Problem = { field: DocField; section: number; error: FieldError };

// Step state of a section-by-section form. The last step (index = sections.length)
// is the review. `strict` (manual fill) enforces the backend's `required`; the AI
// flow only enforces formats because the server completes unanswered fields.
export function useSectionWizard(sections: DocSection[], answers: DocAnswers, o: { strict: boolean; initial?: number }) {
  const last = sections.length;
  const [step, setStep] = useState(Math.min(Math.max(o.initial ?? 0, 0), last));
  const [touched, setTouched] = useState<Record<string, true>>({});
  const at = Math.min(step, last);
  const section = sections[at] as DocSection | undefined;

  const problems: Problem[] = sections.flatMap((s, i) =>
    s.fields.flatMap((field) => {
      const e = validateField(field, answers[field.key]);
      return e && (o.strict || e !== "required") ? [{ field, section: i, error: e }] : [];
    }),
  );
  const touch = (s?: DocSection) => s && setTouched((t) => ({ ...t, ...Object.fromEntries(s.fields.map((f) => [f.key, true as const])) }));
  const errorOf = (key: string): FieldError | "" => (touched[key] ? problems.find((p) => p.field.key === key)?.error ?? "" : "");

  const go = (n: number) => setStep(Math.min(Math.max(n, 0), last));
  const next = (): boolean => {
    touch(section);
    if (section && problems.some((p) => p.section === at)) {
      errorHaptic();
      return false;
    }
    go(at + 1);
    return true;
  };
  const jump = (i: number) => {
    touch(sections[i]);
    go(i);
  };
  return { step: at, section, review: at === last, last, problems, errorOf, next, back: () => go(at - 1), go, jump };
}
