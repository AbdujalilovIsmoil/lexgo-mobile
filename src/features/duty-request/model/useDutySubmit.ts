import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, isPaymentRequired } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast, useErrorText } from "@/shared/ui";
import { docKeys } from "@/entities/my-document";
import { useDocRefusal } from "@/entities/doc-settings";
import { trackDoc } from "@/shared/analytics";
import { ctorPromptFor, existingOf, markCtorAsked, submitDuty, type DutyCtor, type DutyResult, type ExistingRef } from "@/entities/duty-request";

// Sends the request and sorts the outcome: created, "already with the advocates" (409), refused by the document service (its code in
// plain words, TZ.md §4), "plan needed" (402) or any other failure (server text in a toast).
export function useDutySubmit() {
  const qc = useQueryClient();
  const { t } = useT();
  const errText = useErrorText();
  const refusal = useDocRefusal();
  const [result, setResult] = useState<DutyResult | null>(null);
  const [existing, setExisting] = useState<ExistingRef | null>(null);
  const [plan, setPlan] = useState("");
  const [prompt, setPrompt] = useState<DutyCtor | null>(null); // README §12: "fill it in yourself too?", asked once after a successful send
  const refresh = () => void qc.invalidateQueries({ queryKey: docKeys.all });
  const m = useMutation({
    mutationFn: submitDuty,
    onSuccess: (r, v) => {
      refresh();
      // already_exists on a 2xx: nothing was created, show the request that is already open.
      if (!r.created) return setExisting({ id: r.docId, workId: r.workId, status: r.status, message: r.message });
      successHaptic();
      setResult(r);
      trackDoc("document_lawyer_request_submitted", { mode: v.kind, category: v.category, language: v.language, status: r.status });
      const ask = ctorPromptFor(r);
      if (ask) { markCtorAsked(r.docId); setPrompt(ask); }
    },
    onError: (e) => {
      errorHaptic();
      const ex = existingOf(e);
      const refused = refusal(e);
      if (ex) {
        setExisting(ex);
        refresh();
      } else if (refused) toast(refused, "err");
      else if (isPaymentRequired(e)) setPlan(e instanceof ApiError && e.detail ? e.detail : t("dm7.planRequired"));
      else toast(e instanceof ApiError && e.status === 422 ? t("dm7.needRequired") : errText(e), "err");
    },
  });
  return { send: m.mutate, pending: m.isPending, result, existing, plan, prompt, closePrompt: () => setPrompt(null), back: () => { setResult(null); setExisting(null); setPlan(""); } };
}
