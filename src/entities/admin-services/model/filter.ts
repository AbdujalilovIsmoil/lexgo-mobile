import type { AdminService } from "./types";

export type StateFilter = "all" | "active" | "inactive";

const hay = (s: AdminService) => [s.name, s.title, s.titleUzLatn, s.titleUzCyrl, s.titleRu, s.slug, s.catalogCode, s.categoryTitle].filter(Boolean).join(" ").toLowerCase();

// Client-side filter: category + state + free text, merged with the ids the server search found.
export function filterServices(list: AdminService[], cat: string, state: StateFilter, term: string, remote: ReadonlySet<string> | null): AdminService[] {
  const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((s) => {
    if (cat && s.categoryId !== cat) return false;
    if (state === "active" && !s.isActive) return false;
    if (state === "inactive" && s.isActive) return false;
    if (!words.length) return true;
    return words.every((w) => hay(s).includes(w)) || !!remote?.has(s.id);
  });
}

// Headline numbers of a (category-scoped) list: total, active, inactive, hand-made (no catalogue row).
export function serviceStats(list: AdminService[]) {
  const active = list.filter((s) => s.isActive).length;
  return { total: list.length, active, inactive: list.length - active, custom: list.filter((s) => !s.hasMetadata).length };
}
