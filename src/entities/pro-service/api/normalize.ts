import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Promo, ProSeller, ProService, ProServices, ServiceStatus } from "../model/types";
import { normBand } from "./normBand";

// "Switched on, waiting for the rules" (web RULES_PENDING): the service takes no orders, so it reads as paused.
const RULES_PENDING = /^(rules?_pending|pending_rules?|rules?_acceptance_required)$/;

const statusOf = (v: unknown): ServiceStatus => {
  const s = asStr(v).trim().toLowerCase();
  return s === "active" || s === "paused" ? s : RULES_PENDING.test(s) ? "paused" : "inactive";
};

const rulesPendingOf = (d: Record<string, unknown>): boolean => {
  const r = asStr(d.rules_status ?? d.rules_state).trim().toLowerCase();
  return d.rules_pending === true || d.rules_accepted === false || r === "pending" || RULES_PENDING.test(r) || RULES_PENDING.test(asStr(d.status).trim().toLowerCase());
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
    priceCapped: d.price_capped === true,
    note: asStr(d.experience_note),
    visible: d.is_marketplace_visible === true || d.marketplace_visible === true || d.visible === true,
    promotion: promo && promo.serviceId === id ? promo : null,
    profileBoost: promo && !promo.serviceId ? promo : null,
    limits: normBand(d.pricing_limits),
    negotiationAllowed: typeof d.negotiation_allowed === "boolean" ? d.negotiation_allowed : null,
    rulesPending: rulesPendingOf(d),
  };
}

// A 0..1 share is shown as a percentage, anything else is taken as it comes.
const percent = (n: number) => (n > 0 && n <= 1 ? Math.round(n * 100) : Math.round(n));

export function normSeller(seller: Record<string, unknown>, p: Record<string, unknown>, verified: boolean): ProSeller {
  const done = p.completed_orders_count ?? p.completed_orders ?? p.orders_completed ?? p.completed_count;
  return {
    name: asStr(p.lawyer_name ?? p.name ?? seller.name ?? seller.full_name).trim(),
    avatarUrl: asStr(p.avatar_url ?? seller.avatar_url),
    kind: asStr(p.seller_type).toLowerCase() === "advokat" ? "advokat" : "yurist",
    verified,
    rating: asNum(p.rating),
    reviews: asNum(p.reviews_count),
    experienceYears: asNum(p.experience_years),
    cases: asNum(p.total_cases),
    successRate: percent(asNum(p.success_rate)),
    completed: done === undefined || done === null ? null : asNum(done),
    about: {
      bio: asStr(p.bio).trim(),
      district: asStr(p.district).trim(),
      languages: asArr(p.languages).map((x) => asStr(x)).filter(Boolean),
      specializations: asArr(p.specializations).map((x) => asStr(x)).filter(Boolean),
      education: asStr(p.education).trim(),
      license: asStr(p.license_number).trim(),
      bar: asStr(p.bar_association).trim(),
      organization: asStr(p.organization_name).trim(),
    },
  };
}

export function normServices(v: unknown): ProServices {
  const d = asDict(v);
  const seller = asDict(d.seller);
  const p = asDict(d.profile);
  const badge = asDict(p.verification_badge);
  const status = asStr(p.verification_status ?? asDict(p.verification).status ?? p.status).toLowerCase();
  const verified = p.is_verified === true || p.lexgo_verified === true || badge.visible === true || /^(approved|verified)$/.test(status);
  return {
    seller: normSeller(seller, p, verified),
    items: asArr(d.items).map(normService).filter((s) => s.id),
    sellerId: asStr(seller.id ?? p.user_id),
    region: asStr(p.region),
    verified,
    verificationStatus: status,
    sellerType: asStr(p.seller_type).toLowerCase(),
    accountStatus: asStr(seller.account_status).toLowerCase(),
  };
}
