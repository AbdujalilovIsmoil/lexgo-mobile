import { useState } from "react";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };

// The HRM endpoints return their whole result, so "show more" only reveals the next slice of the loaded list.
export function useLocalPaged<T>(query: Q, all: T[], size = 20) {
  const [shown, setShown] = useState(size);
  const hasNextPage = shown < all.length;
  return {
    items: all.slice(0, shown),
    total: all.length,
    query: {
      isLoading: query.isLoading, isError: query.isError, error: query.error, refetch: query.refetch, isRefetching: query.isRefetching,
      hasNextPage, fetchNextPage: () => setShown((n) => n + size), isFetchingNextPage: false,
    },
  };
}
