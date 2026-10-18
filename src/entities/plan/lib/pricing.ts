import { planPerMonth, planSavingPct, planTotal, type BillingPeriod } from "../model/period";
import type { Plan } from "../model/types";

// The terms the backend sells: monthly / six_month / yearly / prepaid_yearly. A card must show what a request will
// charge, so every price below comes from GET /subscription-plans and there is no 3-month term (the backend has no
// such period: it would be billed as one month).
export type Term = 1 | 6 | 12;
export const AI_TERMS: Term[] = [1, 6, 12];
export const FEATURED_SLUG = "lexgo-ai-pro";
const AI_SLUG = /^lexgo-ai-(free|lite|pro)$/;
const AI_LIMIT: Record<string, number> = { "lexgo-ai-free": 5, "lexgo-ai-lite": 100, "lexgo-ai-pro": 1000 };

export const isAiPlan = (p: Plan): boolean => AI_SLUG.test(p.slug);
export const aiLimit = (p: Plan): number => Number(p.entitlements?.ai_requests ?? 0) || AI_LIMIT[p.slug] || 0;

export const termPeriod = (term: Term, upfront: boolean): BillingPeriod => (term === 6 ? "six_month" : term === 12 ? (upfront ? "prepaid_yearly" : "yearly") : "monthly");

// Total for the term from the backend, the average per month, and the saving against paying month by month
// (e.g. Lite 6 months: 279 300 total = 46 550 a month, −5 % of 6 × 49 000).
export function aiPricing(plan: Plan, term: Term, upfront: boolean) {
  const p = termPeriod(term, upfront);
  return { perMonth: planPerMonth(plan, p), total: planTotal(plan, p), savePct: planSavingPct(plan, p) };
}

// "Shaxsiy advokatim": the backend's own 6 / 12 / prepaid-12 totals.
export function otherPricing(plan: Plan, term: 6 | 12, upfront: boolean) {
  const m = plan.monthlyPrice;
  const total = term === 12 ? (upfront ? plan.prepaidYearlyPrice : plan.yearlyPrice) || m * 12 : plan.sixMonthPrice || m * 6;
  const base = m * term;
  return { perMonth: Math.round(total / term), total, savePct: base && total ? Math.round(((base - total) / base) * 100) : 0 };
}

// Featured plans first for this role (target_roles), then the backend order.
export function orderPlans(list: Plan[], mine: (p: Plan) => boolean): Plan[] {
  return [...list].sort((a, b) => Number(!mine(a)) - Number(!mine(b)) || a.sortOrder - b.sortOrder || a.monthlyPrice - b.monthlyPrice);
}
