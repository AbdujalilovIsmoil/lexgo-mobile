import { useMemo } from "react";
import {
  DOC_VALUES, EXEC_VALUES, NO_SUBCAT, PRICE_VALUES, inDoc, inExec, inPrice, sortServices, useCatalogSearch, useCategoryServices,
  type DocFilter, type ExecFilter, type PriceFilter, type Service,
} from "@/entities/service";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import type { CatalogFilters } from "./useCatalogFilters";
import type { CatalogNav } from "./useCatalogNav";

const NONE: Service[] = [];

// The service rows of the screen: the picked category (grouped by its real `subcategory`) or the
// catalogue-wide search, narrowed to a preselected advocate's services, then filtered and sorted.
export function useCatalogServices(nav: CatalogNav, f: CatalogFilters, offered: Set<string> | null) {
  const { locale } = useT();
  const svc = useCategoryServices(nav.cat);
  const term = nav.q.trim();
  const typed = useDebounced(term, 300);
  const search = useCatalogSearch(nav.searching ? typed : "");
  const only = offered && offered.size > 0 ? offered : null;
  const raw = svc.data ?? NONE;
  const catalog = useMemo(() => (only ? raw.filter((s) => only.has(s.id)) : raw), [raw, only]);
  const waiting = nav.searching && (typed !== term || search.isPending);
  const list = useMemo(() => {
    if (nav.searching) return waiting ? NONE : only ? (search.data ?? NONE).filter((s) => only.has(s.id)) : (search.data ?? NONE);
    if (!nav.cat || !nav.subcat) return NONE;
    return catalog.filter((s) => (s.subcategory || NO_SUBCAT) === nav.subcat).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [nav.searching, nav.cat, nav.subcat, waiting, only, search.data, catalog, locale]);
  const ok = (s: Service, d: DocFilter, p: PriceFilter, e: ExecFilter) => inDoc(s, d) && inPrice(s, p) && inExec(s, e);
  const shown = useMemo(() => sortServices(list.filter((s) => ok(s, f.doc, f.price, f.exec)), f.svcSort, locale), [list, f.doc, f.price, f.exec, f.svcSort, locale]);
  // How many services each option would leave against the other groups' current choices.
  const counts = useMemo(() => {
    const n = (d: DocFilter, p: PriceFilter, e: ExecFilter) => list.filter((s) => ok(s, d, p, e)).length;
    return {
      doc: Object.fromEntries(DOC_VALUES.map((v) => [v, n(v, f.price, f.exec)])) as Record<DocFilter, number>,
      price: Object.fromEntries(PRICE_VALUES.map((v) => [v, n(f.doc, v, f.exec)])) as Record<PriceFilter, number>,
      exec: Object.fromEntries(EXEC_VALUES.map((v) => [v, n(f.doc, f.price, v)])) as Record<ExecFilter, number>,
    };
  }, [list, f.doc, f.price, f.exec]);
  return { svc, catalog, narrowed: !!only, shown, counts, loading: (!!nav.cat && svc.isPending) || waiting, failed: !!nav.cat && svc.isError };
}
