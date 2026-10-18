import { useInfiniteQuery } from "@tanstack/react-query";
import { listEligibleSellers } from "../api/sellersApi";

export const sellerKeys = { of: (packageId: string) => ["package-sellers", packageId] as const };

// Pages of the backend's own ranking; `fetchNextPage` appends the next 30.
export const useEligibleSellers = (packageId: string, on: boolean) =>
  useInfiniteQuery({ queryKey: sellerKeys.of(packageId), queryFn: ({ pageParam }) => listEligibleSellers(packageId, pageParam), initialPageParam: 0, getNextPageParam: (p) => (p.hasMore ? p.offset : undefined), enabled: on && !!packageId, staleTime: 30_000 });
