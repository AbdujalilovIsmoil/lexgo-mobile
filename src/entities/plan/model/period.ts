import type { Plan } from "./types";

export type BillingPeriod = "monthly" | "six_month" | "yearly" | "prepaid_yearly";
export const PERIODS: BillingPeriod[] = ["monthly", "six_month", "yearly", "prepaid_yearly"];

// Periods the backend sells this plan for (an unknown answer means all of them). What a period costs is the quote's (usePlanQuote).
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
