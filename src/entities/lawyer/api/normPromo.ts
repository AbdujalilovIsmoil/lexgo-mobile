import { API_BASE, isApiUrl } from "@/shared/config/env";
import { asDict, asNum, asStr } from "@/shared/lib/json";
import { isLexgoVerified } from "@/shared/lib/lexgoBadge";
import { cleanTitle } from "../lib/cleanTitle";
import { isRated } from "../lib/rating";
import type { PromoSurface } from "../model/marketTypes";

// The banner picture as a link the phone can load: our API's asset path (/promotions/assets/{id}/file) gets the API origin, any other
// picture must already be https on its own (phones refuse plain http). Anything else is "" and the banner shows as a profile card.
function pictureUrl(v: string): string {
  const s = v.trim();
  if (s.startsWith("/") && !s.startsWith("//")) return `${API_BASE}${s}`;
  return /^https:\/\/\S+$/i.test(s) || isApiUrl(s) ? s : "";
}

// A paid placement (banner / profile boost / service boost) as the list and /promotions/active return it. Only the seller's public
// card is read: the LexGo badge is `is_verified` / `lexgo_verified` and the rating counts only when the backend rates him.
export function normPromo(v: unknown): PromoSurface {
  const d = asDict(v);
  const seller = asDict(d.seller);
  const profile = asDict(d.seller_profile);
  const service = asDict(d.service);
  const rating = asNum(profile.rating);
  const reviews = asNum(profile.reviews_count);
  return {
    id: asStr(d.id ?? d.promotion_id),
    placement: asStr(d.placement),
    sellerUserId: asStr(d.seller_user_id ?? d.user_id ?? seller.id ?? profile.user_id),
    sellerName: asStr(d.seller_name ?? seller.name ?? profile.name),
    sellerKind: asStr(profile.seller_type ?? seller.role),
    sellerRegion: asStr(profile.region),
    sellerHeadline: asStr(profile.headline),
    sellerRating: rating,
    sellerReviews: reviews,
    sellerRated: isRated(asStr(profile.rating_status), rating, reviews),
    sellerYears: asNum(profile.experience_years),
    sellerVerified: isLexgoVerified(profile),
    serviceId: asStr(d.service_id ?? service.id),
    serviceTitle: cleanTitle(asStr(d.service_title ?? service.title ?? service.name)),
    title: asStr(d.title),
    subtitle: asStr(d.subtitle),
    ctaLabel: asStr(d.cta_label),
    ctaUrl: asStr(d.cta_url),
    imageUrl: pictureUrl(asStr(d.image_url) || asStr(d.banner_image_url)),
    bannerMode: asStr(d.banner_mode).trim().toLowerCase(),
    endsAt: asStr(d.ends_at),
  };
}

export const hasPromoTarget = (p: PromoSurface): boolean => !!(p.sellerUserId || p.serviceId || p.imageUrl || p.title);
