import { useState } from "react";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };

// Client-side "show more": the document endpoints ignore limit/offset, so the full list is fetched
// once and revealed in steps (reset when `key` changes). Returns what `PagedList` expects as `query`.
export function useLocalPaged<T>(q: Q, items: T[], key: string, step = 15) {
  const [state, setState] = useState({ key, n: step });
  const n = state.key === key ? state.n : step;
  const query = {
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    isRefetching: q.isRefetching,
    hasNextPage: items.length > n,
    fetchNextPage: () => setState({ key, n: n + step }),
    isFetchingNextPage: false,
  };
  return { shown: items.slice(0, n), query };
}
