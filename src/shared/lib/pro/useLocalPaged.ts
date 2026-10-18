import { useState } from "react";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };

// Client-side paging for endpoints that return one plain array (they ignore limit/offset):
// shows `step` rows and grows on demand. The window resets whenever `resetKey` changes.
export function useLocalPaged<T>(items: T[], query: Q, resetKey = "", step = 20) {
  const [state, setState] = useState({ key: resetKey, count: step });
  if (state.key !== resetKey) setState({ key: resetKey, count: step });
  const count = state.key === resetKey ? state.count : step;
  const paged = {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    hasNextPage: items.length > count,
    isFetchingNextPage: false,
    fetchNextPage: () => setState((s) => ({ ...s, count: count + step })),
  };
  return { shown: items.slice(0, count), query: paged };
}
