import { useMemo, useState } from "react";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };

// "Show more" over a list the backend returns whole (sessions, audit log). The result is shaped
// like a paged query, so it plugs into PagedList. Call `reset` when the filter changes.
export function useLocalPaged<T>(all: T[], q: Q, size = 20) {
  const [n, setN] = useState(size);
  const items = useMemo(() => all.slice(0, n), [all, n]);
  const query = {
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    isRefetching: q.isRefetching,
    hasNextPage: all.length > n,
    fetchNextPage: () => setN((v) => v + size),
    isFetchingNextPage: false,
  };
  return { items, total: all.length, query, reset: () => setN(size) };
}
