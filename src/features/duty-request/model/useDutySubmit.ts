import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, isPaymentRequired } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast, useErrorText } from "@/shared/ui";
import { docKeys } from "@/entities/my-document";
import { existingOf, submitDuty, type DutyResult, type ExistingRef } from "@/entities/duty-request";

// Sends the request and sorts the outcome: created, "already with the advocates" (409),
// "plan needed" (402) or any other failure (server text in a toast).
export function useDutySubmit() {
  const qc = useQueryClient();
  const { t } = useT();
  const errText = useErrorText();
  const [result, setResult] = useState<DutyResult | null>(null);
  const [existing, setExisting] = useState<ExistingRef | null>(null);
  const [plan, setPlan] = useState("");
  const refresh = () => void qc.invalidateQueries({ queryKey: docKeys.all });
  const m = useMutation({
    mutationFn: submitDuty,
    onSuccess: (r) => {
      refresh();
      // already_exists on a 2xx: nothing was created, show the request that is already open.
      if (!r.created) return setExisting({ id: r.docId, workId: r.workId, status: r.status, message: r.message });
      successHaptic();
      setResult(r);
    },
    onError: (e) => {
      errorHaptic();
      const ex = existingOf(e);
      if (ex) {
        setExisting(ex);
        refresh();
      } else if (isPaymentRequired(e)) setPlan(e instanceof ApiError && e.detail ? e.detail : t("dm7.planRequired"));
      else toast(e instanceof ApiError && e.status === 422 ? t("dm7.needRequired") : errText(e), "err");
    },
  });
  return { send: m.mutate, pending: m.isPending, result, existing, plan, back: () => { setResult(null); setExisting(null); setPlan(""); } };
}
