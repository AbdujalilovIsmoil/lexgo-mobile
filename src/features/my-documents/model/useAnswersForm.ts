import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { answerText, docKeys, fieldKind, generateDoc, isoDate, missingRequired, normalizeAnswer, previewAnswers, saveAnswers, type MyDoc } from "@/entities/my-document";

// Local copy of the answers while the sheet is open: dates as YYYY-MM-DD for the date field,
// everything else as stored. Saved in the canonical form (dd.mm.yyyy dates, grouped numbers).
export function useAnswersForm(doc: MyDoc, visible: boolean, close: () => void) {
  const [values, setValues] = useState<Record<string, string>>({});
  const initial = () => Object.fromEntries(doc.fields.map((f) => [f.name, fieldKind(f) === "date" ? isoDate(answerText(doc.answers, f.name)) : answerText(doc.answers, f.name)]));
  useSheetReset(visible, () => setValues(initial()));

  const missing = missingRequired(doc.fields, values);
  const filled = doc.fields.filter((f) => normalizeAnswer(fieldKind(f), values[f.name] ?? "") !== "").length;
  // Unknown keys the lawyer flow stored (need, language…) are passed through untouched.
  const payload = (): Record<string, unknown> => {
    const out: Record<string, unknown> = { ...doc.answers };
    for (const f of doc.fields) {
      const v = normalizeAnswer(fieldKind(f), values[f.name] ?? "");
      if (v !== "" || f.name in out) out[f.name] = v;
    }
    return out;
  };

  const save = useAdminMutation({ mutationFn: () => saveAnswers(doc.id, payload()), invalidate: [docKeys.all], success: "dm4.saved", onSuccess: close });
  const create = useAdminMutation({
    mutationFn: async () => {
      await saveAnswers(doc.id, payload());
      return generateDoc(doc.id);
    },
    invalidate: [docKeys.all],
    success: "dm4.generated",
    onSuccess: close,
  });
  const preview = useMutation({ mutationFn: () => previewAnswers(doc.id, payload()) });
  return { values, set: (name: string, v: string) => setValues((cur) => ({ ...cur, [name]: v })), missing, filled, save, create, preview };
}
