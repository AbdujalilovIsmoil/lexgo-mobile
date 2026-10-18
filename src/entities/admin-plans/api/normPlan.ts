import { asArr, asDict, asNum, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { Plan, PlanOverride } from "../model/types";
import { LEGACY_PLAN_SLUGS } from "./overlayApi";

const loc = (v: unknown, locale: string, fb: string): string => {
  const d = v && typeof v === "object" && !Array.isArray(v) ? (v as Dict) : null;
  return d ? asStr(d[locale] ?? d.uz, fb) : asStr(v ?? fb);
};

// Plan with the admin overlay applied (title, prices, benefits … and hidden / overridden flags).
export function normPlan(v: unknown, locale: string, ov: Record<string, PlanOverride>): Plan {
  const d = asDict(v);
  const slug = asStr(d.slug);
  const o = ov[slug];
  const benefits = Array.isArray(d.benefits) ? d.benefits.map((x) => asStr(x)) : asArr(asDict(d.features).uz).map((x) => asStr(x));
  const title = asStr(d.title) || loc(d.name, "uz", "");
  return {
    id: asStr(d.id),
    name: o?.title ?? loc(d.name, locale, title),
    title: o?.title ?? title,
    slug,
    monthlyPrice: o?.monthly_price ?? uzs(d, "monthly_price", "price"),
    sixMonthPrice: o?.six_month_price ?? uzs(d, "six_month_price"),
    yearlyPrice: o?.yearly_price ?? uzs(d, "yearly_price"),
    prepaidYearlyPrice: o?.prepaid_yearly_price ?? uzs(d, "prepaid_yearly_price"),
    audience: o?.audience ?? asStr(d.audience),
    targetRoles: asArr(d.target_roles).map((x) => asStr(x)),
    autoChargeProvider: asStr(d.auto_charge_provider),
    billingType: asStr(d.billing_type),
    sortOrder: asNum(d.sort_order),
    allowedGiftDurations: asArr(d.allowed_gift_durations).map((x) => asNum(x)),
    description: o?.description ?? asStr(d.description),
    benefits: o?.benefits ?? benefits,
    isGiftable: o?.is_giftable ?? Boolean(d.is_giftable),
    isActive: o?.is_active ?? d.is_active !== false,
    overridden: !!o && Object.keys(o).some((k) => k !== "hidden"),
    hidden: o?.hidden ?? LEGACY_PLAN_SLUGS.has(slug),
  };
}
