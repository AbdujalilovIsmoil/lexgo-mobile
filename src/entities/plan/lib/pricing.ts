import type { BillingPeriod } from "../model/period";
import type { Plan } from "../model/types";

// The terms the backend sells: monthly / six_month / yearly / prepaid_yearly (there is no 3-month period: it would be billed as one month).
// A card shows the backend's quote for the chosen term (PlanPrice), never a total, a monthly average or a saving worked out here.
export type Term = 1 | 6 | 12;
export const AI_TERMS: Term[] = [1, 6, 12];
export const FEATURED_SLUG = "lexgo-ai-pro";
const AI_SLUG = /^lexgo-ai-(free|lite|pro)$/;
const AI_LIMIT: Record<string, number> = { "lexgo-ai-free": 5, "lexgo-ai-lite": 100, "lexgo-ai-pro": 1000 };

export const isAiPlan = (p: Plan): boolean => AI_SLUG.test(p.slug);
export const aiLimit = (p: Plan): number => Number(p.entitlements?.ai_requests ?? 0) || AI_LIMIT[p.slug] || 0;

export const termPeriod = (term: Term, upfront: boolean): BillingPeriod => (term === 6 ? "six_month" : term === 12 ? (upfront ? "prepaid_yearly" : "yearly") : "monthly");

// Featured plans first for this role (target_roles), then the backend order.
export function orderPlans(list: Plan[], mine: (p: Plan) => boolean): Plan[] {
  return [...list].sort((a, b) => Number(!mine(a)) - Number(!mine(b)) || a.sortOrder - b.sortOrder || a.monthlyPrice - b.monthlyPrice);
}
