import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom, uzs, type Dict } from "@/shared/lib/json";
import type { AssistPlan, UrgentCatalog, UrgentService } from "../model/lookupTypes";
import { urgentFallback, URGENT_KINDS } from "../lib/urgent";

const loc = (v: unknown, locale: string, fallback: string) => (v && typeof v === "object" && !Array.isArray(v) ? asStr((v as Dict)[locale] ?? (v as Dict).uz ?? fallback) : asStr(v ?? fallback));

export async function listPlans(locale: string): Promise<AssistPlan[]> {
  return listFrom(await http("/subscription-plans"), "plans", "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id), name: loc(d.name, locale, asStr(d.title)), slug: asStr(d.slug), monthly: uzs(d, "monthly_price", "price"), sixMonth: uzs(d, "six_month_price"),
      yearly: uzs(d, "yearly_price"), prepaidYearly: uzs(d, "prepaid_yearly_price"), periods: asArr(d.allowed_billing_periods).map((x) => asStr(x)),
      features: asArr(asDict(d.features)[locale] ?? asDict(d.features).uz).map((x) => asStr(x)).filter(Boolean),
      targetRoles: asArr(d.target_roles).map((x) => asStr(x)), audience: asStr(d.audience), giftable: Boolean(d.is_giftable) || asStr(d.billing_type) === "gift", active: d.is_active !== false, sortOrder: asNum(d.sort_order),
    };
  });
}

function normUrgent(v: unknown): UrgentService {
  const d = asDict(v);
  return {
    key: asStr(d.key), title: asStr(d.title), price: uzs(d, "price"), minutes: asNum(d.meeting_minutes), priorPurchase: Boolean(d.requires_prior_lexgo_purchase),
    lawyerMin: asNum(d.lawyer_count_min, 2), lawyerMax: asNum(d.lawyer_count_max, 7), immediate: Boolean(d.immediate_call),
    variants: asArr(d.variants).map((x) => {
      const w = asDict(x);
      return { channel: asStr(w.channel), price: uzs(w, "price"), pricePerLawyer: uzs(w, "price_per_lawyer"), minutes: asNum(w.meeting_minutes) };
    }),
  };
}

// GET /urgent-advokat/catalog; falls back to unpriced services when it fails.
export async function getUrgentCatalog(): Promise<UrgentCatalog> {
  try {
    const by = new Map(listFrom(await http("/urgent-advokat/catalog"), "services", "items", "data").map(normUrgent).map((s) => [s.key, s] as const));
    const fb = new Map(urgentFallback().services.map((s) => [s.key, s] as const));
    return { services: URGENT_KINDS.map((k) => by.get(k) ?? fb.get(k)!), priced: by.size > 0 };
  } catch {
    return urgentFallback();
  }
}
