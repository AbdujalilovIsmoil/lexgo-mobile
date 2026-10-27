import { http } from "@/shared/api";
import { asDict, asNum, asStr } from "@/shared/lib/json";
import { numOrNull } from "../lib/terms";
import type { BillingPeriod } from "../model/period";

// TZ.md "Subscription plan quote": what a checkout charges for a plan and a billing period — the base, a running campaign's discount
// and the amount to pay, all whole so'm and all the backend's. The phone shows them as they are and never works a discount out itself.
export type PlanCampaign = { id: string; title: string; discountType: string; discountValue: number; endsAt: string };
export type PlanQuote = { months: number; base: number; discount: number; amount: number; currency: string; campaign: PlanCampaign | null };

// A quote, or the same `pricing` breakdown of a purchase / Telegram request answer. null when it names no amount (nothing to show).
export function normQuote(v: unknown): PlanQuote | null {
  const d = asDict(v);
  const amount = numOrNull(d.amount);
  if (amount === null) return null;
  const c = asDict(d.campaign);
  return {
    months: asNum(d.months),
    base: numOrNull(d.base_amount) ?? amount,
    discount: Math.max(0, numOrNull(d.discount_amount) ?? 0),
    amount,
    currency: asStr(d.currency, "UZS"),
    campaign: asStr(c.id) || asStr(c.title) ? { id: asStr(c.id), title: asStr(c.title), discountType: asStr(c.discount_type), discountValue: asNum(c.discount_value), endsAt: asStr(c.ends_at) } : null,
  };
}

// GET /subscription-plans/{id}/quote?billing_period=… — public; signed in, the token goes along (a campaign may target the account).
export const getPlanQuote = async (planId: string, period: BillingPeriod): Promise<PlanQuote | null> =>
  normQuote(await http(`/subscription-plans/${encodeURIComponent(planId)}/quote?billing_period=${period}`));
