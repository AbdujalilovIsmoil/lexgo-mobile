import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { entitlementKeys, refusedPeriods, requestPlanPurchase, type BillingPeriod, type PlanRequest } from "@/entities/plan";
import { payKeys } from "@/entities/payment";
import { profileKey } from "@/entities/profile-extras";
import { successHaptic } from "@/shared/lib/haptics";

export type TelegramProblem = "refused" | "undelivered" | "error";

// POST /subscription-plans/{id}/telegram-purchase-request. The answer is a PENDING receipt (SUB-xxxx);
// a 422 names the periods the plan sells, so the chips narrow to them instead of repeating the refusal.
export function useTelegramRequest() {
  const qc = useQueryClient();
  const [only, setOnly] = useState<BillingPeriod[] | null>(null);
  const [sent, setSent] = useState<PlanRequest | null>(null);
  const [problem, setProblem] = useState<TelegramProblem | null>(null);
  const [detail, setDetail] = useState("");
  const m = useMutation({
    mutationFn: (v: { planId: string; period: BillingPeriod }) => requestPlanPurchase(v.planId, v.period),
    onMutate: () => { setProblem(null); setDetail(""); },
    onSuccess: (r) => {
      successHaptic();
      setSent(r);
      if (!r.sent) setProblem("undelivered");
      void qc.invalidateQueries({ queryKey: payKeys.list });
      void qc.invalidateQueries({ queryKey: entitlementKeys.all });
      void qc.invalidateQueries({ queryKey: ["plans"] });
      void qc.invalidateQueries({ queryKey: profileKey });
    },
    onError: (e) => {
      const refused = refusedPeriods(e);
      if (refused.length) { setOnly(refused); setProblem("refused"); } else { setProblem("error"); setDetail(e instanceof ApiError ? e.detail ?? "" : ""); }
    },
  });
  const reset = () => { m.reset(); setOnly(null); setSent(null); setProblem(null); setDetail(""); };
  return { send: (planId: string, period: BillingPeriod) => m.mutate({ planId, period }), pending: m.isPending, only, sent, problem, detail, reset };
}
