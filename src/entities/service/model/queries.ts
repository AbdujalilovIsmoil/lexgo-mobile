import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocaleStore } from "@/shared/i18n";
import { listCategories, listServices, searchServices } from "../api/serviceApi";
import { getPassport } from "../api/passportApi";

export const serviceKeys = {
  categories: ["service-categories"] as const,
  list: (categoryId: string, locale: string) => ["services", categoryId, locale] as const,
  search: (q: string, locale: string) => ["services-search", q, locale] as const,
  pages: (cat: string, sub: string, q: string, locale: string) => ["services-pages", cat, sub, q, locale] as const,
  passport: (id: string, locale: string) => ["service-passport", id, locale] as const,
};

const DAY = 24 * 60 * 60 * 1000;

export function useServiceCategories() {
  return useQuery({
    queryKey: serviceKeys.categories,
    queryFn: listCategories,
    // An empty answer is never trusted: it is asked again at once.
    staleTime: (q) => (q.state.data?.length ? 10 * 60 * 1000 : 0),
    gcTime: DAY,
  });
}

// The first page of the catalogue (optionally one category) for pickers that must show something before anything is typed.
export function useCatalogBrowse(categoryId = "") {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({
    queryKey: ["services-browse", categoryId, locale] as const,
    queryFn: () => listServices({ categoryId: categoryId || undefined, limit: 50 }, locale),
    staleTime: 5 * 60 * 1000,
  });
}

export function useServices(categoryId: string) {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({
    queryKey: serviceKeys.list(categoryId, locale),
    queryFn: () => listServices({ categoryId, limit: 100 }, locale),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

// Search runs on the server from 2 characters; callers debounce the text.
export function useServiceSearch(q: string) {
  const locale = useLocaleStore((s) => s.locale);
  const t = q.trim();
  return useQuery({
    queryKey: serviceKeys.search(t, locale),
    queryFn: () => searchServices(t, locale),
    enabled: t.length >= 2,
    staleTime: 60 * 1000,
  });
}

export const SERVICE_PAGE = 12;

// A direction's services, SERVICE_PAGE at a time; search and subdirection are
// applied by the server, "show more" fetches the next page.
export function useServicePages(cat: string, sub: string, q: string) {
  const locale = useLocaleStore((s) => s.locale);
  return useInfiniteQuery({
    queryKey: serviceKeys.pages(cat, sub, q, locale),
    queryFn: ({ pageParam }) => listServices({ categoryId: cat, sub, q, limit: SERVICE_PAGE, offset: pageParam }, locale),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length === SERVICE_PAGE ? all.length * SERVICE_PAGE : undefined),
    enabled: !!cat,
    staleTime: 5 * 60 * 1000,
  });
}

// Passport + the full service card; changes rarely, so it stays fresh for a while.
export function useServicePassport(id: string) {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({ queryKey: serviceKeys.passport(id, locale), queryFn: () => getPassport(id, locale), enabled: !!id, staleTime: 30 * 60 * 1000, gcTime: DAY });
}
