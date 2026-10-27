import { useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementKeys, purchasePlan, type BillingPeriod, type Plan, type PlanQuote } from "@/entities/plan";
import { isProviderDown, PROVIDER_LADDER, payKeys, usePaymentError } from "@/entities/payment";
import { profileKey } from "@/entities/profile-extras";
import { successHaptic } from "@/shared/lib/haptics";

export type CheckoutInput = { plan: Plan; period: BillingPeriod; autoRenew: boolean; paymentMethodId?: string };
// invoice: a provider payment page; unavailable: no provider is connected, so the Telegram approval sheet opens (as on web).
// `pricing`: the breakdown the backend stored with the invoice (base, campaign, amount) — shown as is.
export type CheckoutOutcome = { kind: "invoice" | "unavailable"; paymentId: string; paymentUrl: string; workId: string; pricing: PlanQuote | null };

async function run(v: CheckoutInput): Promise<CheckoutOutcome> {
  for (const provider of PROVIDER_LADDER) {
    try {
      const r = await purchasePlan(v.plan.id, { period: v.period, provider, autoRenew: v.autoRenew, paymentMethodId: v.paymentMethodId });
      return { kind: "invoice", paymentId: r.paymentId, paymentUrl: r.paymentUrl, workId: r.paymentWorkId || r.workId, pricing: r.pricing };
    } catch (e) {
      if (!isProviderDown(e)) throw e;
    }
  }
  return { kind: "unavailable", paymentId: "", paymentUrl: "", workId: "", pricing: null };
}

// Buying a plan only ever CREATES a pending payment; the plan turns active when the backend
// says so (socket → usePaymentSync → entitlements). A 402/422 is explained by usePaymentError.
export function usePlanCheckout(onDone: (o: CheckoutOutcome) => void) {
  const qc = useQueryClient();
  const fail = usePaymentError();
  return useMutation({
    mutationFn: run,
    onSuccess: (o) => {
      if (o.kind === "invoice") successHaptic();
      void qc.invalidateQueries({ queryKey: payKeys.list });
      void qc.invalidateQueries({ queryKey: entitlementKeys.all });
      void qc.invalidateQueries({ queryKey: profileKey });
      onDone(o);
    },
    onError: fail,
  });
}
