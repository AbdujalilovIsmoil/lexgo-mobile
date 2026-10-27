import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { isLexgoVerified } from "@/shared/lib/lexgoBadge";
import { isRated } from "../lib/rating";
import { normReview, normService } from "./normService";
import type { Lawyer } from "../model/types";

const NEW_DAYS = 60;

// Read like normMarketSeller() in lib/services/marketplace.ts on the web, with two rules of the public-profile privacy (contract §22): the
// LexGo badge comes from `is_verified` or `lexgo_verified` (never verification_status or the badge object), and the private fields
// (education, licence, bar association) and the ranking data are not read at all.
export function normLawyer(v: unknown): Lawyer {
  const d = asDict(v);
  const user = asDict(d.user);
  const promo = asDict(d.promotion);
  const reviews = asNum(d.reviews_count ?? d.reviews);
  const rating = asNum(d.rating);
  const sellerType = asStr(d.seller_type).toLowerCase();
  const createdAt = asStr(d.created_at);
  const ageDays = createdAt ? (Date.now() - new Date(createdAt).getTime()) / 86_400_000 : NaN;
  const services = asArr(d.services).map(normService).filter((x) => x.id);
  const prices = services.map((x) => x.price).filter((p) => p > 0);
  const from = uzs(d, "price_from") || (prices.length ? Math.min(...prices) : 0);
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
    rated: isRated(asStr(d.rating_status), rating, reviews),
    basePrice: from || uzs(d, "base_hourly_price", "price"),
    priceTo: uzs(d, "price_to") || (prices.length ? Math.max(...prices) : 0),
    bio: asStr(d.bio).trim() || undefined,
    verified: isLexgoVerified(d),
    badge: asStr(asDict(d.verification_badge).label), // only the wording of the badge; whether it shows is `verified`
    kind: sellerType.includes("advokat") || sellerType.includes("advocate") ? "advocate" : "lawyer",
    totalCases: asNum(d.total_cases),
    winsCount: asNum(d.wins_count),
    partialWins: asNum(d.partial_wins_count),
    successRate: asNum(d.success_rate),
    completed: asNum(d.completed_orders),
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
