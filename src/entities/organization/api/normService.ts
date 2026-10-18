import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { ManagedList, ManagedService, Modifier, PriceBand, ServiceStatus } from "../model/serviceTypes";

const statusOf = (v: unknown): ServiceStatus => {
  const s = asStr(v).trim().toLowerCase();
  return s === "active" || s === "paused" ? s : "inactive";
};

const modifier = (v: unknown): Modifier => {
  const d = asDict(v);
  return { code: asStr(d.code), key: asStr(d.key), amount: asNum(d.amount), percent: asNum(d.percent) };
};

// pricing_limits (item) or a 422 detail: the allowed range of the seller's price for one service.
export function normBand(v: unknown): PriceBand | null {
  const d = asDict(v);
  const max = uzs(d, "max_allowed", "max_price", "recommended_price");
  const min = uzs(d, "min_allowed", "min_price");
  if (!max || min > max) return null;
  return { recommended: uzs(d, "recommended_price", "max_allowed"), min, max, base: uzs(d, "base_price"), modifiers: asArr(d.modifiers).map(modifier) };
}

export function normManaged(v: unknown, locale = "uz"): ManagedService {
  const d = asDict(v);
  const promo = asDict(d.promotion);
  const name = asStr((locale === "ru" ? d.title_ru : d.title_uz_latn) ?? d.title).trim() || asStr(d.title);
  return {
    id: asStr(d.id),
    name,
    category: asStr(d.category_title) || asStr(d.subcategory),
    catalogPrice: uzs(d, "standard_price", "base_price"),
    catalogActive: d.is_active !== false,
    advocateOnly: d.advokat_required === true,
    status: statusOf(d.status),
    selectedPrice: uzs(d, "selected_price"),
    effectivePrice: uzs(d, "effective_price"),
    note: asStr(d.experience_note),
    visible: d.is_marketplace_visible === true,
    promotedDays: promo.active === true ? asNum(promo.days_left) : 0,
    promoRequest: asStr(asDict(d.promotion_request).status),
    band: normBand(d.pricing_limits),
  };
}

export function normManagedList(v: unknown, locale: string): ManagedList {
  const d = asDict(v);
  const p = asDict(d.profile);
  const status = asStr(p.verification_status).toLowerCase();
  return {
    sellerName: asStr(asDict(d.seller).name).trim() || asStr(p.lawyer_name),
    sellerKind: asStr(p.seller_type),
    region: asStr(p.region),
    verified: p.is_verified === true || status === "approved" || status === "verified",
    canManage: d.can_manage !== false,
    items: asArr(d.items).map((x) => normManaged(x, locale)).filter((x) => x.id),
  };
}
