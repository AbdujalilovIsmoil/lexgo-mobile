import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Promo, ProService, ProServices, ServiceStatus } from "../model/types";
import { normBand } from "./normBand";

const statusOf = (v: unknown): ServiceStatus => {
  const s = asStr(v).trim().toLowerCase();
  return s === "active" || s === "paused" ? s : "inactive";
};

function normPromo(v: unknown): Promo | null {
  const d = asDict(v);
  if (d.active !== true) return null;
  return { id: asStr(d.id), serviceId: asStr(d.service_id), packageTitle: asStr(d.package_title), daysLeft: asNum(d.days_left), endsAt: asStr(d.ends_at) };
}

export function normService(v: unknown): ProService {
  const d = asDict(v);
  const id = asStr(d.id ?? d.service_id);
  const promo = normPromo(d.promotion);
  return {
    id,
    name: asStr(d.title_uz_latn ?? d.title ?? d.name).trim(),
    categoryTitle: asStr(d.category_title),
    subcategory: asStr(d.subcategory),
    catalogPrice: uzs(d, "standard_price", "base_price"),
    catalogActive: d.is_active !== false,
    advokatRequired: d.advokat_required === true,
    status: statusOf(d.status),
    selectedPrice: uzs(d, "selected_price"),
    effectivePrice: uzs(d, "effective_price", "selected_price"),
    note: asStr(d.experience_note),
    visible: d.is_marketplace_visible === true || d.marketplace_visible === true || d.visible === true,
    promotion: promo && promo.serviceId === id ? promo : null,
    profileBoost: promo && !promo.serviceId ? promo : null,
    limits: normBand(d.pricing_limits),
  };
}

export function normServices(v: unknown): ProServices {
  const d = asDict(v);
  const seller = asDict(d.seller);
  const p = asDict(d.profile);
  const badge = asDict(p.verification_badge);
  const status = asStr(p.verification_status ?? asDict(p.verification).status ?? p.status).toLowerCase();
  return {
    items: asArr(d.items).map(normService).filter((s) => s.id),
    sellerId: asStr(seller.id ?? p.user_id),
    region: asStr(p.region),
    verified: p.is_verified === true || p.lexgo_verified === true || badge.visible === true || /^(approved|verified)$/.test(status),
    verificationStatus: status,
    sellerType: asStr(p.seller_type).toLowerCase(),
    accountStatus: asStr(seller.account_status).toLowerCase(),
  };
}
