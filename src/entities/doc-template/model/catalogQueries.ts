import { useCallback, useMemo } from "react";
import { useQueries, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getTemplateDetail, listLinkedServices, listTemplateCategories } from "../api/catalogApi";
import { listTemplates } from "../api/templateApi";
import type { DocTemplate } from "../lib/match";
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
// (the four known ones until it has answered). `combine` re-runs only when a request's state changes, so `rows` keeps its identity while
// the screen re-renders (each keystroke of the search): the catalogue's memoised filters over ~1,000 rows are not recomputed every time.
export function useCatalogTemplates(branch: string) {
  const cats = useTemplateCategories();
  const keys = useMemo(() => (cats.data?.length ? cats.data.map((c) => c.key) : [...TEMPLATE_CATEGORIES]), [cats.data]);
  const on = useMemo(() => (branch ? [branch] : keys), [branch, keys]);
  const combine = useCallback(
    (results: UseQueryResult<DocTemplate[]>[]) => {
      const act = results.filter((_, i) => on.includes(keys[i]));
      const rows = act.flatMap((q) => q.data ?? []);
      const failed = act.find((q) => q.isError && !q.data);
      return {
        rows,
        loading: !rows.length && act.some((q) => q.isLoading) && !failed,
        loadingMore: act.some((q) => q.isLoading),
        error: !rows.length && failed ? failed.error : null,
        refetching: act.some((q) => q.isRefetching),
        refetchAll: () => Promise.all(act.map((q) => q.refetch())),
      };
    },
    [keys, on],
  );
  const list = useQueries({ queries: keys.map((k) => ({ queryKey: ["doc-templates", k], queryFn: () => listTemplates(k), enabled: on.includes(k), staleTime: HALF_DAY })), combine });
  const { refetchAll, ...rest } = list;
  return { ...rest, keys, refetch: () => Promise.all([refetchAll(), cats.refetch()]) };
}
