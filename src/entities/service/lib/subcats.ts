import { inSize, type DirSize, type SubSort } from "./filters";
import type { Service, ServiceCategory } from "../model/types";

export const NO_SUBCAT = "Boshqa";

export type SubRow = { name: string; n: number; samples: string[] };
export type FlatSubcat = SubRow & { cat: string; catName: string };

// Every category's subcategories in one list, largest first, each carrying its category.
export function flattenSubcats(cats: ServiceCategory[]): FlatSubcat[] {
  const out = cats.flatMap((c) => c.subcategories.map((sc) => ({ cat: c.id, catName: c.name, name: sc.title, n: sc.servicesCount, samples: sc.samples ?? [] })));
  return out.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
}

export function sortSubcats<T extends { name: string; n: number }>(rows: T[], sort: SubSort): T[] {
  const name = (a: T, b: T) => a.name.localeCompare(b.name);
  if (sort === "name") return [...rows].sort(name);
  return [...rows].sort((a, b) => (sort === "countAsc" ? a.n - b.n : b.n - a.n) || name(a, b));
}

export const filterSize = <T extends { n: number }>(rows: T[], size: DirSize): T[] => rows.filter((r) => inSize(r.n, size));

// One category's subcategories: the backend's counts win until its services are loaded, then the
// counted rows (what a tap really shows) take over.
export function categorySubRows(cat: ServiceCategory | undefined, services: Service[]): SubRow[] {
  const derived = new Map<string, number>();
  for (const s of services) derived.set(s.subcategory || NO_SUBCAT, (derived.get(s.subcategory || NO_SUBCAT) ?? 0) + 1);
  const rows = new Map<string, SubRow>();
  for (const sc of cat?.subcategories ?? []) rows.set(sc.title, { name: sc.title, n: sc.servicesCount, samples: sc.samples ?? [] });
  for (const [name, n] of derived) rows.set(name, { name, n, samples: rows.get(name)?.samples ?? [] });
  return [...rows.values()];
}
