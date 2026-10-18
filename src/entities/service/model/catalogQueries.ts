import { useQuery } from "@tanstack/react-query";
import { useLocaleStore } from "@/shared/i18n";
import { listServices } from "../api/serviceApi";
import { listCategoryServices, searchCatalog } from "../api/catalogApi";

// The picked category's whole catalogue (all pages); grouped and filtered on the phone.
export function useCategoryServices(cat: string) {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({ queryKey: ["services-catalog", cat, locale], queryFn: () => listCategoryServices(cat, locale), enabled: !!cat, staleTime: 5 * 60 * 1000 });
}

// Catalogue-wide search (ranked + plain filter); callers debounce and pass a term of 2+ characters.
export function useCatalogSearch(term: string) {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({ queryKey: ["services-catalog-search", term, locale], queryFn: () => searchCatalog(term, locale), enabled: term.length >= 2, staleTime: 60 * 1000 });
}

// The first 200 catalogue services: what the Services tab lists at once (filtered by direction on the phone).
export function useAllServices() {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({ queryKey: ["services-all", locale], queryFn: () => listServices({ catalogOnly: true, limit: 200 }, locale), staleTime: 5 * 60 * 1000 });
}
