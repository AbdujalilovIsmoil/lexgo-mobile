import { asDict, asNum, asStr } from "@/shared/lib/json";
import { cleanTitle } from "../lib/cleanTitle";
import type { PromoSurface } from "../model/marketTypes";

// A paid placement (banner / profile boost / service boost) as the list and
// /promotions/active return it. Only the seller's public card is read: the LexGo badge is `is_verified` alone.
export function normPromo(v: unknown): PromoSurface {
  const d = asDict(v);
  const seller = asDict(d.seller);
  const profile = asDict(d.seller_profile);
  const service = asDict(d.service);
  return {
    id: asStr(d.id ?? d.promotion_id),
    placement: asStr(d.placement),
    sellerUserId: asStr(d.seller_user_id ?? d.user_id ?? seller.id ?? profile.user_id),
    sellerName: asStr(d.seller_name ?? seller.name ?? profile.name),
    sellerKind: asStr(profile.seller_type ?? seller.role),
    sellerRegion: asStr(profile.region),
    sellerRating: asNum(profile.rating),
    sellerReviews: asNum(profile.reviews_count),
    sellerYears: asNum(profile.experience_years),
    sellerVerified: profile.is_verified === true,
    serviceId: asStr(d.service_id ?? service.id),
    serviceTitle: cleanTitle(asStr(d.service_title ?? service.title ?? service.name)),
    title: asStr(d.title),
    subtitle: asStr(d.subtitle),
    ctaLabel: asStr(d.cta_label),
    ctaUrl: asStr(d.cta_url),
    imageUrl: asStr(d.image_url ?? d.banner_image_url),
    endsAt: asStr(d.ends_at),
  };
}

export const hasPromoTarget = (p: PromoSurface): boolean => !!(p.sellerUserId || p.serviceId || p.imageUrl || p.title);
