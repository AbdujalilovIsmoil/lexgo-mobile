import { useQuery } from "@tanstack/react-query";
import { getMyRating, getSellerRating } from "../api/ratingApi";

// The breakdown changes only when an order closes or the policy is recalculated: ten minutes of freshness is plenty.
const FRESH = 10 * 60 * 1000;

export const useMyRating = (enabled: boolean) => useQuery({ queryKey: ["seller-rating", "me"], queryFn: getMyRating, enabled, staleTime: FRESH, retry: 1 });
export const useSellerRating = (userId: string) => useQuery({ queryKey: ["seller-rating", userId], queryFn: () => getSellerRating(userId), enabled: !!userId, staleTime: FRESH, retry: 1 });
