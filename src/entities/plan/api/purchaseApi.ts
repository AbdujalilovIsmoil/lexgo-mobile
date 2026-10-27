import { ApiError, http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { safeHttpsUrl } from "@/shared/lib/pay/safeUrl";
import { asPeriod, PERIODS, type BillingPeriod } from "../model/period";
import { normQuote, type PlanQuote } from "./quoteApi";

// `pricing` (both answers): the immutable price breakdown the backend stored with the payment / request — base, campaign, amount.
export type PurchaseResult = { workId: string; subscriptionId: string; status: string; paymentId: string; paymentWorkId: string; paymentUrl: string; amount: number; pricing: PlanQuote | null };

// POST /subscription-plans/{id}/purchase — a provider invoice; the plan activates only after
// the backend marks the payment paid (the app watches it, it never sets it).
export async function purchasePlan(planId: string, i: { period: BillingPeriod; provider: string; autoRenew: boolean; paymentMethodId?: string }): Promise<PurchaseResult> {
  const body = { billing_period: i.period, provider: i.provider, currency: "UZS", auto_renew: i.autoRenew, family_members: [], ...(i.paymentMethodId ? { payment_method_id: i.paymentMethodId } : {}) };
  const d = asDict(await http(`/subscription-plans/${encodeURIComponent(planId)}/purchase`, { method: "POST", body }));
  const pay = asDict(d.payment);
  return {
    workId: asStr(d.work_id),
    subscriptionId: asStr(d.subscription_id),
    status: asStr(d.status),
    paymentId: asStr(pay.id),
    paymentWorkId: asStr(pay.work_id),
    paymentUrl: safeHttpsUrl(pay.payment_url),
    amount: asNum(pay.amount),
    pricing: normQuote(d.pricing),
  };
}

export type PlanRequest = { id: string; workId: string; status: string; paymentId: string; amount: number; sent: boolean; failed: number; pricing: PlanQuote | null };

// The Telegram request answer as the app reads it (pure, so it is tested without a network).
export function normPlanRequest(v: unknown): PlanRequest {
  const d = asDict(v);
  const p = asDict(d.payload);
  const results = asArr(d.telegram_results ?? p.telegram_results).map((x) => asDict(x));
  const pricing = normQuote(d.pricing ?? p.pricing);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    status: asStr(d.status, "pending"),
    paymentId: asStr(d.payment_id ?? p.payment_id),
    amount: pricing?.amount ?? asNum(d.amount ?? d.price ?? p.amount),
    sent: d.telegram_sent === true || results.some((r) => r.ok !== false),
    failed: results.filter((r) => r.ok === false).length,
    pricing,
  };
}

// POST /subscription-plans/{id}/telegram-purchase-request — an operator approves it in Telegram.
export async function requestPlanPurchase(planId: string, period: BillingPeriod): Promise<PlanRequest> {
  const body = { billing_period: period, currency: "UZS" };
  return normPlanRequest(await http(`/subscription-plans/${encodeURIComponent(planId)}/telegram-purchase-request`, { method: "POST", body }));
}

// A period the plan does not sell answers 422 listing the ones it does.
export function refusedPeriods(e: unknown): BillingPeriod[] {
  if (!(e instanceof ApiError) || e.status !== 422) return [];
  const detail = asDict(e.data.detail);
  const allowed = asArr(detail.allowed_billing_periods).map((x) => asStr(x));
  return PERIODS.filter((p) => allowed.includes(p)).map(asPeriod);
}
