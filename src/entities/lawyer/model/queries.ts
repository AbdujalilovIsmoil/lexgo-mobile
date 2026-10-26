import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { listLawyers } from "../api/lawyerApi";
import { getLawyer } from "../api/profileApi";
import { defaultLawyerFilters, type LawyerFilters } from "./filters";

export const PAGE_SIZE = 10;

export const lawyerKeys = {
  list: (f: Partial<LawyerFilters>) => ["lawyers", f] as const,
  pages: (f: Partial<LawyerFilters>) => ["lawyers-pages", f] as const,
  count: (f: Partial<LawyerFilters>) => ["lawyers-count", f] as const,
  one: (id: string) => ["lawyer", id] as const,
};

// The Lawyers tab: PAGE_SIZE at a time. A new filter is a new key, so the list
// shows its skeleton; "show more" fetches the next page from the server.
export function useLawyerPages(filters: Partial<LawyerFilters> = defaultLawyerFilters) {
  return useInfiniteQuery({
    queryKey: lawyerKeys.pages(filters),
    queryFn: ({ pageParam }) => listLawyers(filters, { limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, _all, offset) => (offset + PAGE_SIZE < last.total ? offset + PAGE_SIZE : undefined),
    staleTime: 2 * 60 * 1000,
  });
}

// Result count only (one row is fetched): the live number on the filter button.
export function useLawyerCount(filters: Partial<LawyerFilters>) {
  return useQuery({ queryKey: lawyerKeys.count(filters), queryFn: () => listLawyers(filters, { limit: 1 }), staleTime: 60 * 1000, select: (p) => p.total });
}

// Whole list in one request, for rails, stat sheets and topic sheets.
export function useLawyerPage(filters: Partial<LawyerFilters> = defaultLawyerFilters) {
  return useQuery({ queryKey: lawyerKeys.list(filters), queryFn: () => listLawyers(filters), staleTime: 2 * 60 * 1000 });
}

export function useLawyer(id: string) {
  return useQuery({ queryKey: lawyerKeys.one(id), queryFn: () => getLawyer(id), enabled: !!id, staleTime: 5 * 60 * 1000 });
}

