import { useMemo, useState } from "react";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useDocFlow, useDocLite, type DocMode } from "@/entities/my-document";
import { bucket, filterDocs, type GroupFilter } from "./filterDocs";

export type { GroupFilter };
const SHOWN = 15;

// The list behind "Mening hujjatlarim". Unfiltered it pages service-flow (rich rows, server
// filter by mode); with a status group or a search it filters the light list on the phone,
// which holds every document — so counts and results are exact, not "what is loaded so far".
export function useDocList() {
  const [group, setGroup] = useState<GroupFilter>("");
  const [mode, setMode] = useState<"" | DocMode>("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(SHOWN);
  const needle = useDebounced(q, 200).trim().toLowerCase();
  const local = !!group || !!needle || !!status;
  const flow = useDocFlow({ mode, status: "" }, !local);
  const lite = useDocLite();

  const works = useMemo(() => new Map((lite.data ?? []).map((r) => [r.id, r.workId])), [lite.data]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: lite.data?.length ?? 0 };
    for (const r of lite.data ?? []) c[bucket(r.status)] = (c[bucket(r.status)] ?? 0) + 1;
    return c;
  }, [lite.data]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of lite.data ?? []) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [lite.data]);

  const filtered = useMemo(() => filterDocs(lite.data ?? [], { group, mode, status, needle }), [lite.data, group, mode, status, needle]);
  const seen = useMemo(() => [...new Set((lite.data ?? []).map((r) => r.status).filter(Boolean))], [lite.data]);

  const items = local ? filtered.slice(0, shown) : flow.items.map((r) => (r.workId ? r : { ...r, workId: works.get(r.id) ?? "" }));
  const refresh = () => Promise.all([lite.refetch(), local ? undefined : flow.query.refetch()]);
  // Both sources read as one "query" for the list: refreshing refetches the counts too.
  const src = local ? lite : flow.query;
  const query = {
    isLoading: src.isLoading, isError: src.isError, error: src.error, isRefetching: src.isRefetching, refetch: refresh,
    hasNextPage: local ? filtered.length > shown : flow.query.hasNextPage,
    fetchNextPage: local ? () => setShown((n) => n + SHOWN) : flow.query.fetchNextPage,
    isFetchingNextPage: local ? false : flow.query.isFetchingNextPage,
  };
  const reset = () => { setGroup(""); setMode(""); setStatus(""); setQ(""); };
  return { items, query, counts, statusCounts, total: filtered.length, countsLoading: lite.isLoading, group, mode, q, status, seen, setStatus: (v: string) => { setShown(SHOWN); setStatus(v); }, local, setGroup: (g: GroupFilter) => { setShown(SHOWN); setGroup(g); }, setMode: (m: "" | DocMode) => { setShown(SHOWN); setMode(m); }, setQ, reset, refresh };
}
