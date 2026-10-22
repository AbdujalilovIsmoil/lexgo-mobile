import { useMemo, useState } from "react";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useDocFlow, useDocLite, type DocMode } from "@/entities/my-document";
import { bucket, filterDocs, type GroupFilter } from "./filterDocs";
import { PAGE, growWindow, pageInfo } from "./pageWindow";

export type { GroupFilter };

// The list behind "Mening hujjatlarim". Unfiltered it pages service-flow (rich rows, server
// filter by mode, 10 rows a page); with a status group or a search it filters the light list on
// the phone (it holds every document) and shows it 10 at a time — counts and totals are exact,
// not "what is loaded so far". Any filter or search resets the window to the first ten.
export function useDocList() {
  const [group, setGroup] = useState<GroupFilter>("");
  const [mode, setMode] = useState<"" | DocMode>("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
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

  // How many documents each of the backend's tabs holds (all / filled myself / with AI / with a lawyer).
  const modeCounts = useMemo(() => {
    const c: Record<string, number> = { all: lite.data?.length ?? 0 };
    for (const r of lite.data ?? []) c[r.mode] = (c[r.mode] ?? 0) + 1;
    return c;
  }, [lite.data]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of lite.data ?? []) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [lite.data]);

  const filtered = useMemo(() => filterDocs(lite.data ?? [], { group, mode, status, needle }), [lite.data, group, mode, status, needle]);
  const seen = useMemo(() => [...new Set((lite.data ?? []).map((r) => r.status).filter(Boolean))], [lite.data]);

  const total = lite.data ? filtered.length : flow.total ?? flow.items.length;
  const items = local ? filtered.slice(0, shown) : flow.items.map((r) => (r.workId ? r : { ...r, workId: works.get(r.id) ?? "" }));
  const refresh = () => Promise.all([lite.refetch(), local ? undefined : flow.query.refetch()]);
  // Both sources read as one "query" for the list: refreshing refetches the counts too.
  const src = local ? lite : flow.query;
  const query = {
    isLoading: src.isLoading, isError: src.isError, error: src.error, isRefetching: src.isRefetching, refetch: refresh,
    hasNextPage: local ? filtered.length > shown : flow.query.hasNextPage,
    fetchNextPage: local ? () => setShown((n) => growWindow(n, filtered.length)) : flow.query.fetchNextPage,
    isFetchingNextPage: local ? false : flow.query.isFetchingNextPage,
  };
  const win = (set: () => void) => { setShown(PAGE); set(); };
  const reset = () => { setShown(PAGE); setGroup(""); setMode(""); setStatus(""); setQ(""); };
  const page = pageInfo(items.length, total);
  return {
    items, query, page, counts, modeCounts, statusCounts, total, countsLoading: lite.isLoading, group, mode, q, status, seen, local, reset, refresh,
    setStatus: (v: string) => win(() => setStatus(v)),
    setGroup: (g: GroupFilter) => win(() => setGroup(g)),
    setMode: (m: "" | DocMode) => win(() => setMode(m)),
    setQ: (v: string) => win(() => setQ(v)),
  };
}
