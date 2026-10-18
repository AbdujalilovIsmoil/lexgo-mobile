import type { AssistPlan } from "../model/lookupTypes";

export const PERIODS = ["monthly", "six_month", "yearly", "prepaid_yearly"] as const;
export type Period = (typeof PERIODS)[number];
const MONTHS: Record<Period, number> = { monthly: 1, six_month: 6, yearly: 12, prepaid_yearly: 12 };

export const isPeriod = (v: string): v is Period => (PERIODS as readonly string[]).includes(v);

// Billing periods a plan may be bought for (all four when the backend does not say).
export function planPeriods(p: AssistPlan): Period[] {
  const allowed = p.periods.filter(isPeriod);
  return PERIODS.filter((x) => !allowed.length || allowed.includes(x));
}

export function planPrice(p: AssistPlan, period: Period): number {
  const listed = period === "monthly" ? p.monthly : period === "six_month" ? p.sixMonth : period === "yearly" ? p.yearly : p.prepaidYearly;
  return listed > 0 ? listed : p.monthly * MONTHS[period];
}

// Who a plan is sold to: the precise role list, else the older audience string, else the slug (as on the web).
function forClient(p: AssistPlan): boolean {
  if (p.targetRoles.length) return p.targetRoles.includes("client");
  const a = p.audience.trim().toLowerCase();
  if (a === "personal" || a === "client") return true;
  if (a) return false;
  return p.slug.toLowerCase().includes("shaxsiy");
}

// Plans an operator may sell to a client: active, not a gift, offered to clients, with a price.
export function sellablePlans(plans: AssistPlan[]): AssistPlan[] {
  const rank = (p: AssistPlan) => (forClient(p) ? 0 : 1);
  return plans
    .filter((p) => p.active && p.id && !p.giftable)
    .filter((p) => !p.targetRoles.length || p.targetRoles.includes("client"))
    .filter((p) => planPeriods(p).some((x) => planPrice(p, x) > 0))
    .sort((a, b) => rank(a) - rank(b) || a.sortOrder - b.sortOrder || a.monthly - b.monthly);
}
