import { useState } from "react";
import { PAGE, pageInfo } from "@/shared/lib/pageWindow";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };

// Client-side "show more": the document endpoints ignore limit/offset, so the full list is fetched
// once and revealed ten at a time (reset to the first ten when `key` changes). Returns what `PagedList` expects as `query`.
export function useLocalPaged<T>(q: Q, items: T[], key: string, step = PAGE) {
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
  const shown = items.slice(0, n);
  return { shown, query, page: pageInfo(shown.length, items.length) };
}
