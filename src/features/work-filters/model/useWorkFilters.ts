import { useMemo, useState } from "react";
import { GROUPS, KINDS, useWorkText, type Work } from "@/entities/work";
import { useDebounced } from "@/shared/lib/useDebounced";
import { filterWorks, haystack, inGroup } from "./match";
import type { GroupFilter, WorkFilters } from "./types";

// Search + kind + status-group filters over the loaded works. The backend ignores
// text search and only filters by a single status, so everything runs on the device.
export function useWorkFilters(items: Work[], initialGroup: GroupFilter = "all") {
  const text = useWorkText();
  const [raw, setRaw] = useState<WorkFilters>({ q: "", kind: "all", group: initialGroup });
  const q = useDebounced(raw.q, 200);
  const filters = useMemo(() => ({ ...raw, q }), [raw, q]);
  const hays = useMemo(() => new Map(items.map((w) => [w.id, haystack(w, `${text.kind(w.kind)} ${text.status(w.status, w.statusLabel)}`)])), [items, text]);
  const shown = useMemo(() => filterWorks(items, filters, hays), [items, filters, hays]);
  const kindCounts = useMemo(() => {
    const base = filterWorks(items, filters, hays, "kind");
    return Object.fromEntries(KINDS.map((k) => [k, base.filter((w) => w.kind === k).length])) as Record<string, number>;
  }, [items, filters, hays]);
  const groupCounts = useMemo(() => {
    const base = filterWorks(items, filters, hays, "group");
    return Object.fromEntries([...GROUPS, "open", "all"].map((g) => [g, base.filter((w) => inGroup(w, g as GroupFilter)).length])) as Record<string, number>;
  }, [items, filters, hays]);
  const set = (patch: Partial<WorkFilters>) => setRaw((f) => ({ ...f, ...patch }));
  const reset = () => setRaw({ q: "", kind: "all", group: initialGroup });
  const active = raw.q.trim() !== "" || raw.kind !== "all" || raw.group !== initialGroup;
  return { filters: raw, set, reset, active, shown, kindCounts, groupCounts };
}
