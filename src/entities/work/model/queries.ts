import { useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { fetchWork, fetchWorksPage } from "../api/worksApi";
import type { Work } from "./types";

export const workKeys = {
  all: ["works"] as const,
  list: ["works", "list"] as const,
  detail: (workId: string) => ["works", "detail", workId] as const,
};

const MAX_ITEMS = 1000;

// Unique by id, most recently changed first.
const merge = (pages: { items: Work[] }[] = []): Work[] => {
  const map = new Map<string, Work>();
  for (const p of pages) for (const w of p.items) map.set(w.id || w.workId, w);
  return [...map.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));
};

// All of the client's works. The first page renders at once; the remaining pages
// load in the background so type/status/search filters and counters are exact (several
// screens may use this hook at once, so the page requests are not cancelled and restarted).
export function useWorks() {
  const authed = useIsAuthed();
  const q = useInfiniteQuery({
    queryKey: workKeys.list,
    enabled: authed,
    staleTime: 2 * 60 * 1000, // useWorksRealtime refreshes it when something changes
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchWorksPage(pageParam),
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return last.items.length > 0 && loaded < last.total && loaded < MAX_ITEMS ? loaded : undefined;
    },
  });
  const { hasNextPage, isFetchingNextPage, isError, fetchNextPage } = q;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) void fetchNextPage({ cancelRefetch: false });
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);
  const items = useMemo(() => merge(q.data?.pages), [q.data]);
  return {
    items,
    total: q.data?.pages[0]?.total ?? 0,
    filling: !!hasNextPage || isFetchingNextPage,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    isRefetching: q.isRefetching && !isFetchingNextPage,
    refetch: q.refetch,
    dataUpdatedAt: q.dataUpdatedAt,
  };
}

export function useWork(workId: string) {
  const authed = useIsAuthed();
  return useQuery({ queryKey: workKeys.detail(workId), queryFn: () => fetchWork(workId), enabled: authed && !!workId, staleTime: 15 * 1000 });
}
