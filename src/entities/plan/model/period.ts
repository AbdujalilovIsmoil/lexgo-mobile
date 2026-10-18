import type { Plan } from "./types";

export type BillingPeriod = "monthly" | "six_month" | "yearly" | "prepaid_yearly";
export const PERIODS: BillingPeriod[] = ["monthly", "six_month", "yearly", "prepaid_yearly"];

export const periodMonths = (p: BillingPeriod): number => (p === "monthly" ? 1 : p === "six_month" ? 6 : 12);

// Total for the period; falls back to monthly × months when the backend has no tier price.
export function planTotal(plan: Plan, p: BillingPeriod): number {
  const tier = p === "monthly" ? plan.monthlyPrice : p === "six_month" ? plan.sixMonthPrice : p === "yearly" ? plan.yearlyPrice : plan.prepaidYearlyPrice || plan.yearlyPrice;
  return tier > 0 ? tier : plan.monthlyPrice * periodMonths(p);
}

export const planPerMonth = (plan: Plan, p: BillingPeriod): number => Math.round(planTotal(plan, p) / periodMonths(p));

export function planSavingPct(plan: Plan, p: BillingPeriod): number {
  const full = plan.monthlyPrice * periodMonths(p);
  const total = planTotal(plan, p);
  return full > 0 && total < full ? Math.round((1 - total / full) * 100) : 0;
}

// Periods the backend sells this plan for (an unknown answer means all of them).
export function allowedPeriods(plan: Plan): BillingPeriod[] {
  const ok = PERIODS.filter((p) => !plan.allowedBillingPeriods.length || plan.allowedBillingPeriods.includes(p));
  return ok.length ? ok : PERIODS;
}

export const asPeriod = (v: string): BillingPeriod => (PERIODS.includes(v as BillingPeriod) ? (v as BillingPeriod) : "monthly");

// Gift terms (months) a giftable plan can be bought for; 3/6/12 when the backend does not say.
export const allowedGiftMonths = (plan: Plan): number[] => (plan.giftDurations.length ? plan.giftDurations : [3, 6, 12]);

// A rough price shown before checkout: the plan's own 6/12-month total, else monthly × months.
export function estimateGift(plan: Plan, months: number): number {
  if (months === 12 && plan.yearlyPrice) return plan.yearlyPrice;
  if (months === 6 && plan.sixMonthPrice) return plan.sixMonthPrice;
  return plan.monthlyPrice * months;
}
