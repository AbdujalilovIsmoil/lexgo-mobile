import type { Person } from "../model/usePeople";

export type PeopleSection = { key: "recent" | "suggested" | "results"; data: Person[] };

/**
 * The result list as sections. Nothing typed: the people picked earlier (still reachable) first, then the rest of what the
 * API offers. Something typed: one "results" section. Order never depends on the current selection, so rows stay put.
 */
export function arrange(found: Person[], recent: Person[], query: string, me: string): PeopleSection[] {
  const q = query.trim();
  if (q) return found.length ? [{ key: "results", data: found }] : [];
  const mine = recent.filter((p) => p.id && p.id !== me);
  const ids = new Set(mine.map((p) => p.id));
  const rest = found.filter((p) => !ids.has(p.id));
  const out: PeopleSection[] = [];
  if (mine.length) out.push({ key: "recent", data: mine });
  if (rest.length) out.push({ key: "suggested", data: rest });
  return out;
}

/** Puts the newly picked people in front of the older ones (no duplicates), keeping at most `cap`. */
export function mergeRecent(prev: Person[], picked: Person[], cap = 8): Person[] {
  const ids = new Set(picked.map((p) => p.id));
  return [...picked, ...prev.filter((p) => !ids.has(p.id))].slice(0, cap);
}
