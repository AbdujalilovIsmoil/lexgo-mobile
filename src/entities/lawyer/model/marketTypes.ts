import type { Lawyer } from "./types";

// What GET /marketplace/meta returns (filter options), trimmed to what the app shows.
export type MarketCategory = { id: string; title: string };
export type MarketMetaService = { id: string; title: string; categoryId: string; basePrice: number };
export type MarketMeta = { categories: MarketCategory[]; services: MarketMetaService[] };

// A paid placement from `sponsored`, `sponsored_profiles`, `banners` or /promotions/active.
export type PromoSurface = {
  id: string;
  placement: string; // banner | profile_boost | service_boost
  sellerUserId: string;
  sellerName: string;
  sellerKind: string; // advokat | yurist | …
  sellerRegion: string;
  sellerRating: number;
  sellerReviews: number;
  sellerYears: number;
  sellerVerified: boolean;
  serviceId: string;
  serviceTitle: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  endsAt: string; // ISO, "" when open-ended
};

// One hit of POST /marketplace/ai-search: who, how well (0..1) and why. `lawyer`
// is set when the hit carries the whole profile, else it is looked up by id.
export type AiMatch = { userId: string; score: number; reasons: string[]; lawyer: Lawyer | null };
export type AiResult = { matches: AiMatch[]; summary: string; disclaimer: string; total: number; sponsored: PromoSurface[]; banners: PromoSurface[] };

// GET /matching/me — the specialists the platform picked for this client.
export type MyMatch = { id: string; kind: "advocate" | "lawyer"; userId: string; name: string; area: string; region: string; rating: number; pct: number; reason: string };
