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

export const usePromoActive = () => useQuery({ queryKey: ["promo-active"], queryFn: () => listActivePromos(6), staleTime: 5 * 60 * 1000 });
