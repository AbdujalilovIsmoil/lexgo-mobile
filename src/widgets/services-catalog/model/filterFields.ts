import {
  DIRSIZE_VALUES, DOC_VALUES, EXEC_VALUES, PRICE_VALUES, SUBSORT_VALUES, SVCSORT_VALUES,
  type DirSize, type DocFilter, type ExecFilter, type PriceFilter,
} from "@/entities/service";
import type { FilterField } from "../ui/FilterSelect";
import type { CatalogFilters } from "./useCatalogFilters";

type T = (key: string) => string;
type Counts = { doc: Record<DocFilter, number>; price: Record<PriceFilter, number>; exec: Record<ExecFilter, number> };

const DOC = { all: "filterAll", template: "filterHasDoc", lawyer: "filterNoDoc" };
const PRICE = { all: "filterAll", free: "filterFree", low: "priceBandLow", mid: "priceBandMid", high: "priceBandHigh" };
const EXEC = { all: "filterAll", ai: "execAi", yurist: "execYurist", advokat: "execAdvokat" };
const SVCSORT = { rel: "sortRelevance", az: "sortByName", cheap: "sortCheapFirst", doc: "sortDocFirst" };
const SUBSORT = { count: "sortByCount", countAsc: "sortByCountAsc", name: "sortByName" };
const SIZE = { all: "filterAll", big: "sizeBig", mid: "sizeMid", small: "sizeSmall" };

const opts = (t: T, values: readonly string[], labels: Record<string, string>, counts?: Record<string, number>) =>
  values.map((v) => ({ value: v, label: counts ? `${t(`csv.${labels[v]}`)} (${counts[v]})` : t(`csv.${labels[v]}`) }));

// The controls the bar carries depend on what the screen can honestly answer: service screens filter
// services, the two direction screens (which hold no service rows) filter on the category counts.
export function filterFields(t: T, f: CatalogFilters, counts: Counts, sizeCounts: Record<DirSize, number>, services: boolean): FilterField[] {
  if (services) {
    return [
      { key: "doc", label: t("csv.filterDoc"), value: f.doc, empty: "all", options: opts(t, DOC_VALUES, DOC, counts.doc), onChange: (v) => f.setDoc(v as DocFilter) },
      { key: "exec", label: t("csv.filterExec"), value: f.exec, empty: "all", options: opts(t, EXEC_VALUES, EXEC, counts.exec), onChange: (v) => f.setExec(v as ExecFilter) },
      { key: "price", label: t("csv.filterPrice"), value: f.price, empty: "all", options: opts(t, PRICE_VALUES, PRICE, counts.price), onChange: (v) => f.setPrice(v as PriceFilter) },
      { key: "sort", label: t("csv.sortLabel"), value: f.svcSort, empty: "rel", options: opts(t, SVCSORT_VALUES, SVCSORT), onChange: (v) => f.setSvcSort(v as typeof f.svcSort) },
    ];
  }
  return [
    { key: "sort", label: t("csv.sortLabel"), value: f.subSort, empty: "count", options: opts(t, SUBSORT_VALUES, SUBSORT), onChange: (v) => f.setSubSort(v as typeof f.subSort) },
    { key: "size", label: t("csv.filterSize"), value: f.size, empty: "all", options: opts(t, DIRSIZE_VALUES, SIZE, sizeCounts), onChange: (v) => f.setSize(v as DirSize) },
  ];
}
