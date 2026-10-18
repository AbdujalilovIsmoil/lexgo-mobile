import { useState } from "react";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };

// Many admin endpoints return the whole list at once, so "show more" only reveals the next slice of what is loaded.
// The slice resets to the first page whenever `resetKey` changes (a new filter or search).
export function useLocalPaged<T>(query: Q, all: T[], size = 20, resetKey = "") {
  const [state, setState] = useState({ shown: size, key: resetKey });
  const shown = state.key === resetKey ? state.shown : size;
  return {
    items: all.slice(0, shown),
    total: all.length,
    query: {
      isLoading: query.isLoading, isError: query.isError, error: query.error, refetch: query.refetch, isRefetching: query.isRefetching,
      hasNextPage: shown < all.length, fetchNextPage: () => setState({ shown: shown + size, key: resetKey }), isFetchingNextPage: false,
    },
  };
}
