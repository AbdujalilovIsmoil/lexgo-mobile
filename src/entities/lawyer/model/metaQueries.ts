import { useQuery } from "@tanstack/react-query";
import { getLawyerServices } from "../api/profileApi";
import { getMarketMeta } from "../api/metaApi";
import { getMyMatches } from "../api/matchApi";
import { getPricingPolicy } from "../api/pricingApi";
import { listActivePromos } from "../api/promoApi";

export const useMarketMeta = () => useQuery({ queryKey: ["market-meta"], queryFn: getMarketMeta, staleTime: 10 * 60 * 1000 });

// Services he sells right now — fresher than the copy inside the profile.
export const useLawyerServices = (id: string) =>
  useQuery({ queryKey: ["lawyer-services", id], queryFn: () => getLawyerServices(id), enabled: !!id, staleTime: 30 * 1000 });

// "Picked for you" (GET /matching/me) — pass `enabled` = signed in.
export const useMyMatches = (enabled: boolean) => useQuery({ queryKey: ["my-matches"], queryFn: getMyMatches, enabled, staleTime: 5 * 60 * 1000 });

export const usePricingPolicy = (enabled: boolean) => useQuery({ queryKey: ["pricing-policy"], queryFn: getPricingPolicy, enabled, staleTime: 30 * 60 * 1000 });

// Running promotions live under ["promo-active", …]: refreshed together after a promotion goes live (entities/promotion).
// The marketplace's top banners only — boosted profiles and services show on their own cards, not in the banner rail.
export const usePromoBanners = () => useQuery({ queryKey: ["promo-active", "banner"], queryFn: () => listActivePromos({ placement: "banner", limit: 6 }), staleTime: 5 * 60 * 1000 });

// Everything one specialist runs now (banner, profile or service boost): the "Top" mark on his page and his boosted services.
export const useSellerPromos = (sellerUserId: string) =>
  useQuery({ queryKey: ["promo-active", "seller", sellerUserId], queryFn: () => listActivePromos({ sellerUserId, limit: 20 }), enabled: !!sellerUserId, staleTime: 5 * 60 * 1000 });
