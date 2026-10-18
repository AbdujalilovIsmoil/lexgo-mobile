import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { pickLoc, pickLocArr } from "../lib/localized";
import type { Plan, PlanFunction } from "../model/types";

function normFunction(v: unknown, locale: string): PlanFunction {
  const d = asDict(v);
  const limit = d.limit == null ? null : asNum(d.limit, NaN);
  return {
    key: asStr(d.key),
    title: pickLoc(d.title, locale, asStr(d.key)),
    description: pickLoc(d.description, locale, ""),
    enabled: d.enabled !== false,
    limit: limit != null && Number.isFinite(limit) ? limit : null,
    unit: asStr(d.unit),
  };
}

export function normPlan(v: unknown, locale: string): Plan {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: pickLoc(d.name, locale, asStr(d.title)),
    slug: asStr(d.slug),
    monthlyPrice: uzs(d, "monthly_price", "price"),
    sixMonthPrice: uzs(d, "six_month_price"),
    yearlyPrice: uzs(d, "yearly_price"),
    prepaidYearlyPrice: uzs(d, "prepaid_yearly_price"),
    audience: asStr(d.audience),
    targetRoles: asArr(d.target_roles).map((x) => asStr(x)),
    description: pickLoc(d.description, locale, ""),
    features: pickLocArr(d.features, locale, d.benefits),
    functions: asArr(d.functions).map((x) => normFunction(x, locale)).filter((f) => f.key),
    entitlements: asDict(d.entitlements),
    isGiftable: Boolean(d.is_giftable),
    isActive: d.is_active !== false,
    sortOrder: asNum(d.sort_order),
    billingType: asStr(d.billing_type),
    autoChargeProvider: asStr(d.auto_charge_provider),
    allowedBillingPeriods: asArr(d.allowed_billing_periods).map((x) => asStr(x)),
    giftDurations: asArr(d.allowed_gift_durations).map((x) => asNum(x)).filter((n) => n > 0),
  };
}
