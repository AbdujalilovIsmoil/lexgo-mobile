import { useState } from "react";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { listQueue } from "../api/ticketApi";
import { oldestFirst, TAB_QUERY } from "../lib/tickets";
import { POLL, supKeys } from "./keys";
import type { SupportTab } from "./types";

const PAGE = 50;
export const TABS: SupportTab[] = ["new", "mine", "transferred", "closed"];

// One queue tab, refreshed every 10 s while the screen is focused. "New" is oldest first.
// The list shows its pull-to-refresh spinner only for manual refreshes, not for the background polls.
export function useSupportQueue(tab: SupportTab) {
  const focused = useIsFocused();
  const [manual, setManual] = useState(false);
  const q = useInfiniteQuery({
    queryKey: [...supKeys.queue(tab), PAGE],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listQueue(TAB_QUERY[tab], { limit: PAGE, offset: pageParam }),
    getNextPageParam: (last, all) => (last.hasMore ? all.reduce((n, p) => n + p.items.length, 0) : undefined),
    refetchInterval: focused ? POLL.queue : false,
  });
  const raw = q.data?.pages.flatMap((p) => p.items) ?? [];
  const query = {
    isLoading: q.isLoading, isError: q.isError, error: q.error, hasNextPage: q.hasNextPage, fetchNextPage: q.fetchNextPage, isFetchingNextPage: q.isFetchingNextPage,
    isRefetching: manual,
    refetch: async () => { setManual(true); try { await q.refetch(); } finally { setManual(false); } },
  };
  return { items: tab === "new" ? [...raw].sort(oldestFirst) : raw, total: q.data?.pages[0]?.total, query };
}

// Ticket count per tab, for the tab chips.
export function useQueueCounts(): Record<SupportTab, number | undefined> {
  const focused = useIsFocused();
  const res = useQueries({
    queries: TABS.map((tab) => ({
      queryKey: [...supKeys.counts, tab],
      queryFn: () => listQueue(TAB_QUERY[tab], { limit: 1, offset: 0 }),
      refetchInterval: focused ? POLL.counts : false,
    })),
  });
  return { new: res[0].data?.total, mine: res[1].data?.total, transferred: res[2].data?.total, closed: res[3].data?.total };
}
