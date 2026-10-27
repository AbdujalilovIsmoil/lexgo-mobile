import type { Lawyer } from "./types";

// What GET /marketplace/meta returns (filter options), trimmed to what the app shows.
export type MarketCategory = { id: string; title: string };
export type MarketMetaService = { id: string; title: string; categoryId: string; basePrice: number };
export type MarketMeta = { categories: MarketCategory[]; services: MarketMetaService[] };

// A paid placement from the list's `banners`, the AI search or /promotions/active.
export type PromoSurface = {
  id: string;
  placement: string; // banner | profile_boost | service_boost
  sellerUserId: string;
  sellerName: string;
  sellerKind: string; // advokat | yurist | …
  sellerRegion: string;
  sellerHeadline: string; // the backend's "Advokat • area • region" line; a subtitle equal to it is not the seller's own text
  sellerRating: number;
  sellerReviews: number;
  sellerRated: boolean; // the rating is shown only when true ("not rated yet" otherwise, never 5.0)
  sellerYears: number;
  sellerVerified: boolean; // `is_verified` only
  serviceId: string;
  serviceTitle: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string; // absolute https link of the banner picture, "" when there is none
  bannerMode: string; // "image" | "profile_card" | "" (older answers: an image when there is one)
  endsAt: string; // ISO, "" when open-ended
};

// One hit of POST /marketplace/ai-search: who, how well (0..1) and why. `lawyer`
// is set when the hit carries the whole profile, else it is looked up by id.
export type AiMatch = { userId: string; score: number; reasons: string[]; lawyer: Lawyer | null };
export type AiResult = { matches: AiMatch[]; summary: string; disclaimer: string; total: number; sponsored: PromoSurface[]; banners: PromoSurface[] };

// GET /matching/me — the specialists the platform picked for this client. `rating` is shown only when `rated`.
export type MyMatch = { id: string; kind: "advocate" | "lawyer"; userId: string; name: string; area: string; region: string; rating: number; rated: boolean; pct: number; reason: string };
