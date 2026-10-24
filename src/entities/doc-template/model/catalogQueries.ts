import { useQueries, useQuery } from "@tanstack/react-query";
import { getTemplateDetail, listLinkedServices, listTemplateCategories } from "../api/catalogApi";
import { listTemplates } from "../api/templateApi";
import { TEMPLATE_CATEGORIES } from "../lib/match";

export const catalogKeys = {
  categories: ["doc-template-categories"] as const,
  detail: (id: string) => ["doc-template", id] as const,
  linked: ["doc-template-linked"] as const,
};

const HALF_DAY = 12 * 60 * 60 * 1000; // the catalogue changes rarely and a refresh costs a 14 MB download

export const useTemplateCategories = () => useQuery({ queryKey: catalogKeys.categories, queryFn: listTemplateCategories, staleTime: HALF_DAY });

export const useTemplateDetail = (id: string) => useQuery({ queryKey: catalogKeys.detail(id), queryFn: () => getTemplateDetail(id), enabled: !!id, staleTime: 5 * 60 * 1000 });

// template id → service id. A failure only means "no linked service": the generic flow still works.
export const useLinkedServices = () => useQuery({ queryKey: catalogKeys.linked, queryFn: listLinkedServices, staleTime: HALF_DAY, retry: 1 });

// The catalogue's templates, public. One request per category in parallel (the server neither pages nor searches, and the big categories
// are ≈9 MB raw, <1 MB over the wire): the small ones show up at once. `branch` "" = every category; the category list comes from the server
// (the four known ones until it has answered).
export function useCatalogTemplates(branch: string) {
  const cats = useTemplateCategories();
  const keys = cats.data?.length ? cats.data.map((c) => c.key) : [...TEMPLATE_CATEGORIES];
  const on = branch ? [branch] : keys;
  const results = useQueries({ queries: keys.map((k) => ({ queryKey: ["doc-templates", k], queryFn: () => listTemplates(k), enabled: on.includes(k), staleTime: HALF_DAY })) });
  const act = keys.map((k, i) => ({ k, q: results[i] })).filter((x) => on.includes(x.k));
  const rows = act.flatMap((x) => x.q.data ?? []);
  const failed = act.find((x) => x.q.isError && !x.q.data);
  return {
    rows,
    keys,
    loading: !rows.length && act.some((x) => x.q.isLoading) && !failed,
    loadingMore: act.some((x) => x.q.isLoading),
    error: !rows.length && failed ? failed.q.error : null,
    refetch: () => Promise.all([...act.map((x) => x.q.refetch()), cats.refetch()]),
    refetching: act.some((x) => x.q.isRefetching),
  };
}
