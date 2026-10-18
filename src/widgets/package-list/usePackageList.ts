import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { codeCount, firstService, groupPackages, isTestPackage, usePackages, type CatalogEntry, type ServicePackage } from "@/entities/package";
import { listServices } from "@/entities/service";
import { useLocaleStore } from "@/shared/i18n";

const PAGE = 500;

// Every catalogue service, paged like the web's getAllServices, keyed by catalogue code.
function useCatalog() {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({
    queryKey: ["packages-catalog", locale],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const m = new Map<string, CatalogEntry>();
      for (let offset = 0; ; offset += PAGE) {
        const page = await listServices({ limit: PAGE, offset }, locale);
        for (const s of page) if (s.catalogCode) m.set(s.catalogCode.toUpperCase(), { id: s.id, price: s.price ?? 0 });
        if (page.length < PAGE) return m;
      }
    },
  });
}

// Packages screen state: search, category, grouping by code, and the "order" jump into the services catalogue.
export function usePackageList() {
  const router = useRouter();
  const pk = usePackages();
  const byCode = useCatalog().data ?? new Map<string, CatalogEntry>();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const real = useMemo(() => (pk.data ?? []).filter((p) => !isTestPackage(p)), [pk.data]);
  const found = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? real.filter((p) => `${p.title} ${p.categoryTitle} ${p.code}`.toLowerCase().includes(n)) : real;
  }, [real, q]);
  const cats = useMemo(() => [...new Set(real.map((p) => p.categoryTitle).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [real]);
  const groups = useMemo(() => groupPackages(found, cat), [found, cat]);
  const catOpts = cats.map((c) => ({ value: c, count: codeCount(found.filter((p) => p.categoryTitle === c)) }));
  const order = (p: ServicePackage) => {
    const first = firstService(p, byCode);
    router.push(first ? { pathname: "/services/[id]", params: { id: first.id, package: p.id } } : { pathname: "/(tabs)/services", params: { q: p.categoryTitle || p.title } });
  };
  return { pk, byCode, q, setQ, cat, setCat, cats, groups, total: codeCount(found), catOpts, order };
}
