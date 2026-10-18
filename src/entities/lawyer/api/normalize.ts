import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { normReview, normService } from "./normService";
import type { Lawyer } from "../model/types";

const NEW_DAYS = 60;

// Same reading as normMarketSeller() in lib/services/marketplace.ts on the web.
export function normLawyer(v: unknown): Lawyer {
  const d = asDict(v);
  const user = asDict(d.user);
  const promo = asDict(d.promotion);
  const badge = asDict(d.verification_badge);
  const reviews = asNum(d.reviews_count ?? d.reviews);
  const rating = asNum(d.rating);
  const ratingStatus = asStr(d.rating_status);
  const sellerType = asStr(d.seller_type).toLowerCase();
  const verificationStatus = asStr(d.verification_status).toLowerCase();
  const createdAt = asStr(d.created_at);
  const ageDays = createdAt ? (Date.now() - new Date(createdAt).getTime()) / 86_400_000 : NaN;
  const services = asArr(d.services).map(normService).filter((x) => x.id);
  const prices = services.map((x) => x.price).filter((p) => p > 0);
  const from = uzs(d, "price_from") || (prices.length ? Math.min(...prices) : 0);
  const legacy = d.lexgo_verified ?? d.is_verified ?? d.verified;
  return {
    id: asStr(d.id ?? d.user_id ?? user.id),
    userId: asStr(d.user_id ?? user.id ?? d.id),
    publicId: asStr(d.public_id ?? d.lexgo_id),
    name: asStr(d.lawyer_name ?? d.name ?? user.name ?? d.full_name).trim(),
    region: asStr(d.region),
    district: asStr(d.district) || undefined,
    specializations: asArr(d.specializations).map((s) => asStr(s)),
    languages: asArr(d.languages).map((l) => asStr(l)),
    experienceYears: asNum(d.experience_years) || asNum(d.lawyer_experience_years),
    rating,
    reviews,
    rated: ratingStatus ? ratingStatus === "rated" && rating > 0 : reviews >= 5 && rating > 0,
    basePrice: from || uzs(d, "base_hourly_price", "price"),
    priceTo: uzs(d, "price_to") || (prices.length ? Math.max(...prices) : 0),
    bio: asStr(d.bio).trim() || undefined,
    verified: badge.visible === true || legacy === true || verificationStatus === "verified" || verificationStatus === "approved",
    badge: asStr(badge.label),
    kind: sellerType.includes("advokat") || sellerType.includes("advocate") ? "advocate" : "lawyer",
    totalCases: asNum(d.total_cases),
    winsCount: asNum(d.wins_count),
    partialWins: asNum(d.partial_wins_count),
    successRate: asNum(d.success_rate),
    completed: asNum(d.completed_orders),
    education: asStr(d.education).trim() || undefined,
    licenseNumber: asStr(d.license_number).trim() || undefined,
    barAssociation: asStr(d.bar_association).trim() || undefined,
    organizationName: asStr(d.organization_name).trim() || undefined,
    createdAt,
    isNew: reviews < 5 && Number.isFinite(ageDays) && ageDays <= NEW_DAYS,
    promoted: promo.active === true || d.is_sponsored === true,
    promotedService: asStr(promo.service_title ?? promo.specialization) || undefined,
    boost: asNum(d.promotion_boost_score ?? promo.boost_score),
    available: asStr(asDict(d.availability).status, "available") !== "offline",
    services,
    reviewList: asArr(d.reviews).map(normReview).filter((r) => r.rating > 0 || r.comment),
  };
}
