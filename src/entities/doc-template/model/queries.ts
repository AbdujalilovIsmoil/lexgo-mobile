import { useQueries } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { listTemplates } from "../api/templateApi";
import { TEMPLATE_CATEGORIES, type DocTemplate } from "../lib/match";

export type Branch = "all" | (typeof TEMPLATE_CATEGORIES)[number];
export type TemplatesState = {
  rows: DocTemplate[];
  counts: Record<(typeof TEMPLATE_CATEGORIES)[number], number | null>; // null = that branch has not arrived yet
  loading: boolean; // nothing to show yet
  loadingMore: boolean; // some branches still on their way
  error: unknown;
  refetch: () => void;
  refetching: boolean;
};

// One request per branch, in parallel: the small ones (criminal, administrative) show up at once while the big ones (civil, economic ≈ 9 MB
// and 5 MB) are still downloading. A single branch asks only for itself.
export function useTemplates(branch: Branch = "all"): TemplatesState {
  const authed = useIsAuthed();
  const cats = branch === "all" ? [...TEMPLATE_CATEGORIES] : [branch];
  const results = useQueries({ queries: TEMPLATE_CATEGORIES.map((c) => ({ queryKey: ["doc-templates", c], queryFn: () => listTemplates(c), enabled: authed && cats.includes(c), staleTime: 30 * 60 * 1000 })) });
  const on = TEMPLATE_CATEGORIES.map((c, i) => ({ c, q: results[i] })).filter((x) => cats.includes(x.c));
  const counts = Object.fromEntries(TEMPLATE_CATEGORIES.map((c, i) => [c, results[i].data ? results[i].data!.length : null])) as TemplatesState["counts"];
  const rows = on.flatMap((x) => x.q.data ?? []);
  const failed = on.find((x) => x.q.isError && !x.q.data);
  return {
    rows,
    counts,
    loading: !rows.length && on.some((x) => x.q.isLoading) && !failed,
    loadingMore: on.some((x) => x.q.isLoading),
    error: !rows.length && failed ? failed.q.error : null,
    refetch: () => on.forEach((x) => void x.q.refetch()),
    refetching: on.some((x) => x.q.isRefetching),
  };
}
