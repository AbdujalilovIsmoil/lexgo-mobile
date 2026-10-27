import { useInfiniteQuery } from "@tanstack/react-query";
import { listMyAchievements, listPublicAchievements } from "../api/achApi";

export const achKeys = {
  all: ["pro-achievements"] as const, // the seller's list: what a submission or a decision changes
  mine: ["pro-achievements", "mine"] as const,
  pub: (sellerId: string) => ["seller-achievements", sellerId] as const,
};

// Ten at a time: `fetchNextPage` appends the next ten.
export const useMyAchievements = () =>
  useInfiniteQuery({ queryKey: achKeys.mine, queryFn: ({ pageParam }) => listMyAchievements(pageParam), initialPageParam: 0, getNextPageParam: (p) => p.next ?? undefined, staleTime: 30 * 1000 });

// Public and slow-changing: five minutes of freshness; a failure shows nothing (the section stays hidden).
export const usePublicAchievements = (sellerId: string) =>
  useInfiniteQuery({ queryKey: achKeys.pub(sellerId), queryFn: ({ pageParam }) => listPublicAchievements(sellerId, pageParam), initialPageParam: 0, getNextPageParam: (p) => p.next ?? undefined, enabled: !!sellerId, staleTime: 5 * 60 * 1000, retry: 1 });
