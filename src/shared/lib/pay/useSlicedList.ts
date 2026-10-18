import { useState } from "react";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };

// Client-side "show more" for lists the backend returns whole (it ignores limit/offset):
// `size` rows first, `size` more per request, and a fresh start whenever `key` changes.
export function useSlicedList<T>(rows: T[], q: Q, key: string, size = 20) {
  const [state, setState] = useState({ key, n: size });
  const n = state.key === key ? state.n : size;
  if (state.key !== key) setState({ key, n: size });
  const query = { ...q, hasNextPage: rows.length > n, fetchNextPage: () => setState({ key, n: n + size }), isFetchingNextPage: false };
  return { items: rows.slice(0, n), query };
}
