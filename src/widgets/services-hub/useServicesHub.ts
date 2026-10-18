import { useMemo, useState } from "react";
import { inDoc, inExec, inPrice, sortServices, useAllServices, useCatalogSearch, useServiceCategories, type DocFilter, type ExecFilter, type PriceFilter, type Service, type SvcSort } from "@/entities/service";
import { useT } from "@/shared/i18n";
import { useDebounced } from "@/shared/lib/useDebounced";

export const FIRST = 12;
export type HubFilters = { cat: string; doc: DocFilter; exec: ExecFilter; price: PriceFilter; sort: SvcSort };
const NONE: HubFilters = { cat: "", doc: "all", exec: "all", price: "all", sort: "rel" };
type Skip = keyof HubFilters | undefined;

// A service passes when it fits every filter except the one being counted (so a count never promises rows the others hide).
const pass = (s: Service, f: HubFilters, skip: Skip) => (skip === "cat" || !f.cat || s.categoryId === f.cat) && (skip === "doc" || inDoc(s, f.doc)) && (skip === "exec" || inExec(s, f.exec)) && (skip === "price" || inPrice(s, f.price));

// The Services tab's data: every service at once, narrowed by the sheet's filters and sort and by the search term (server search
// from two characters); when an advocate was picked in the directory, only what that advocate sells.
export function useServicesHub(offered: Set<string> | null) {
  const { locale } = useT();
  const cats = useServiceCategories();
  const all = useAllServices();
  const [q, setQ] = useState("");
  const [f, setF] = useState<HubFilters>(NONE);
  const [shown, setShown] = useState(FIRST);
  const term = useDebounced(q.trim(), 300);
  const found = useCatalogSearch(term);
  const searching = term.length >= 2;
  const source = searching ? found.data : all.data;
  const base = useMemo(() => (source ?? []).filter((s) => !offered?.size || offered.has(s.id)), [source, offered]);
  const rows = useMemo(() => sortServices(base.filter((s) => pass(s, f, undefined)), f.sort, locale), [base, f, locale]);
  const set = (p: Partial<HubFilters>) => { setF((x) => ({ ...x, ...p })); setShown(FIRST); };
  const counts = useMemo(() => {
    const of = (skip: Skip, key: (s: Service) => string): Record<string, number> => {
      const m: Record<string, number> = {};
      for (const s of base) if (pass(s, f, skip)) m[key(s)] = (m[key(s)] ?? 0) + 1;
      return m;
    };
    return { cat: of("cat", (s) => s.categoryId ?? ""), doc: of("doc", (s) => (s.documentTemplateId ? "template" : "lawyer")), exec: base.filter((s) => pass(s, f, "exec")), price: base.filter((s) => pass(s, f, "price")) };
  }, [base, f]);
  const active = (f.cat ? 1 : 0) + (f.doc !== "all" ? 1 : 0) + (f.exec !== "all" ? 1 : 0) + (f.price !== "all" ? 1 : 0) + (f.sort !== "rel" ? 1 : 0);
  return { cats: cats.data ?? [], q, setQ, f, set, reset: () => set(NONE), active, counts, rows, visible: rows.slice(0, shown), more: () => setShown((n) => n + FIRST), left: Math.max(0, rows.length - shown), loading: searching ? found.isPending : all.isPending, error: searching ? found.error : all.error, retry: () => void (searching ? found.refetch() : all.refetch()) };
}

export type Hub = ReturnType<typeof useServicesHub>;
