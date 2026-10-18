import { useInfiniteQuery } from "@tanstack/react-query";

export type Page<T> = { items: T[]; total?: number; hasMore?: boolean };
type Fetcher<T> = (p: { limit: number; offset: number }) => Promise<Page<T>>;

// limit/offset paging for admin lists. `fetchPage` returns one page; the hook
// flattens them and asks for the next one while the server says there is more
// (or, without a `hasMore`, while a full page came back).
export function usePaged<T>(key: readonly unknown[], fetchPage: Fetcher<T>, opts: { pageSize?: number; enabled?: boolean } = {}) {
  const limit = opts.pageSize ?? 20;
  const query = useInfiniteQuery({
    queryKey: [...key, limit],
    initialPageParam: 0,
    enabled: opts.enabled ?? true,
    queryFn: ({ pageParam }) => fetchPage({ limit, offset: pageParam }),
    getNextPageParam: (last, all) => {
      const more = last.hasMore ?? last.items.length >= limit;
      return more && last.items.length > 0 ? all.reduce((n, p) => n + p.items.length, 0) : undefined;
    },
  });
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total;
  return { items, total, query };
}
