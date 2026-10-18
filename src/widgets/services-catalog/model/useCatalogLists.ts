import { useMemo } from "react";
import { categorySubRows, filterSize, flattenSubcats, sizeOf, sortSubcats, useServiceCategories, type DirSize, type Service } from "@/entities/service";
import type { CatalogFilters } from "./useCatalogFilters";
import type { CatalogNav } from "./useCatalogNav";

// The two direction screens: the flat list of every subcategory (with the family strip as a
// filter) and one category's own subcategories.
export function useCatalogLists(nav: CatalogNav, f: CatalogFilters, catalog: Service[]) {
  const cats = useServiceCategories();
  const list = useMemo(() => cats.data ?? [], [cats.data]);
  const all = useMemo(() => flattenSubcats(list), [list]);
  const fam = useMemo(() => (nav.fam ? all.filter((x) => x.cat === nav.fam) : all), [all, nav.fam]);
  const flat = useMemo(() => sortSubcats(filterSize(fam, f.size), f.subSort), [fam, f.size, f.subSort]);
  const catRow = list.find((c) => c.id === nav.cat);
  const rows = useMemo(() => categorySubRows(catRow, catalog), [catRow, catalog]);
  const subList = useMemo(() => sortSubcats(filterSize(rows, f.size), f.subSort), [rows, f.size, f.subSort]);
  const showSubcats = !nav.searching && !!nav.cat && !nav.subcat;
  const dirRows = showSubcats ? rows : fam;
  const sizeCounts = useMemo(() => {
    const c: Record<DirSize, number> = { all: dirRows.length, big: 0, mid: 0, small: 0 };
    for (const r of dirRows) c[sizeOf(r.n)] += 1;
    return c;
  }, [dirRows]);
  const perCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of all) m.set(x.cat, (m.get(x.cat) ?? 0) + 1);
    return m;
  }, [all]);
  const totalServices = list.reduce((n, c) => n + c.servicesCount, 0);
  return { cats, list, all, flat, catRow, subList, rows, showSubcats, sizeCounts, perCat, totalServices };
}
