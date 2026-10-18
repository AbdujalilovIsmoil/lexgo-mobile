import { OPEN_GROUPS, workGroup } from "@/entities/work/model/group";
import type { Work } from "@/entities/work/model/types";
import type { GroupFilter, WorkFilters } from "./types";

export const inGroup = (w: Work, g: GroupFilter): boolean => {
  if (g === "all") return true;
  const own = workGroup(w.status);
  return g === "open" ? OPEN_GROUPS.includes(own) : own === g;
};

const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[ʻʼ’‘`']/g, "");

// Lower-cased haystack of one work for the search box.
export const haystack = (w: Work, extra: string): string => fold(`${w.title} ${w.workId} ${w.assignee?.name ?? ""} ${extra}`);

export const matchesQuery = (hay: string, q: string): boolean => {
  const words = fold(q).split(/\s+/).filter(Boolean);
  return words.every((x) => hay.includes(x));
};

// Facets: each count ignores its own dimension, so a chip never promises rows the others would hide.
export function filterWorks(items: Work[], f: WorkFilters, hays: Map<string, string>, skip?: "kind" | "group") {
  return items.filter(
    (w) => (skip === "kind" || f.kind === "all" || w.kind === f.kind) && (skip === "group" || inGroup(w, f.group)) && (!f.q.trim() || matchesQuery(hays.get(w.id) ?? "", f.q)),
  );
}
