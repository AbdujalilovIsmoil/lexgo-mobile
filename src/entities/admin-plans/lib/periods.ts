import type { BillingPeriod, Plan, PlanAudience, PlanInput } from "../model/types";

export const BILLING_PERIODS: BillingPeriod[] = ["monthly", "six_month", "yearly", "prepaid_yearly"];
export const PLAN_AUDIENCES: PlanAudience[] = ["client", "yurist", "advokat", "business"];

export function planPrice(p: Plan, period: BillingPeriod): number {
  return period === "monthly" ? p.monthlyPrice : period === "six_month" ? p.sixMonthPrice : period === "yearly" ? p.yearlyPrice : p.prepaidYearlyPrice;
}

// The period an admin edits by default: monthly when priced, else the first priced one.
export const primaryPeriod = (p: Plan): BillingPeriod => BILLING_PERIODS.find((x) => planPrice(p, x) > 0) ?? "monthly";

// Price fields from one (period, price) pair; other periods keep the plan's values (edit) or 0 (create — the backend completes them from monthly).
export function pricesFor(period: BillingPeriod, price: number, base?: Plan): Pick<PlanInput, "monthly_price" | "six_month_price" | "yearly_price" | "prepaid_yearly_price"> {
  const pick = (p: BillingPeriod) => (p === period ? Math.max(0, Math.round(price)) : base ? planPrice(base, p) : 0);
  return { monthly_price: pick("monthly"), six_month_price: pick("six_month"), yearly_price: pick("yearly"), prepaid_yearly_price: pick("prepaid_yearly") };
}

// Roles a tariff is sold to. The backend rewrites `audience` by slug (personal / seller / business), so map it back.
export function planAudience(p: Pick<Plan, "audience" | "slug">): PlanAudience[] {
  const a = p.audience.trim().toLowerCase();
  if (a === "personal" || a === "client") return ["client"];
  if (a === "seller") return ["yurist", "advokat"];
  if (a === "business" || a === "b2b") return ["business"];
  if (a === "yurist" || a === "lawyer") return ["yurist"];
  if (a === "advokat" || a === "advocate") return ["advokat"];
  const s = p.slug.toLowerCase();
  if (s.includes("b2b") || s.includes("business")) return ["business"];
  return s.includes("shaxsiy") ? ["client"] : ["yurist", "advokat"];
}
