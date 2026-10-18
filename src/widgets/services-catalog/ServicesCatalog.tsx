import { StyleSheet, View } from "react-native";
import { ServiceCardSkeleton, type Service } from "@/entities/service";
import { ErrorView, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { filterFields } from "./model/filterFields";
import { useCatalogFilters } from "./model/useCatalogFilters";
import { useCatalogLists } from "./model/useCatalogLists";
import { useCatalogNav } from "./model/useCatalogNav";
import { useCatalogServices } from "./model/useCatalogServices";
import { useCatalogActions, type Dl } from "./model/useCatalogActions";
import { BackRow } from "./ui/BackRow";
import { CatalogHeader } from "./ui/CatalogHeader";
import { CardGrid } from "./ui/CardGrid";
import { CategoryCards } from "./ui/CategoryCards";
import { DirectionCards } from "./ui/DirectionCards";
import { FilterBar } from "./ui/FilterBar";
import { SubcatCard } from "./ui/SubcatCard";
import { ServiceResults } from "./ui/ServiceResults";

type Props = { init: { cat?: string; subcat?: string; q?: string }; offered: Set<string> | null; dl: Dl; onNewDoc: () => void; onOrder: (s: Service) => void; onOpen?: (cat: string, name: string) => void; pinned?: boolean };

// The catalogue exactly as the web walks it: areas strip -> directions -> services, one filter row
// on every screen, search across the whole catalogue from two characters on. `onOpen` makes a direction a page of
// its own; `pinned` is that page (no way back inside it, the header has one).
export function ServicesCatalog({ init, offered, dl, onNewDoc, onOrder, onOpen, pinned }: Props) {
  const { t } = useT();
  const nav = useCatalogNav(init);
  const f = useCatalogFilters();
  const data = useCatalogServices(nav, f, offered);
  const L = useCatalogLists(nav, f, data.catalog);
  const act = useCatalogActions(dl, onOrder);
  const open = onOpen ?? nav.openSubcat;
  const families = !nav.searching && !nav.cat;
  const services = !families && !L.showSubcats;
  const wait = L.cats.isPending || data.loading;
  const count = wait ? "" : services ? t("csv.servicesN", { n: data.shown.length }) : t("csv.subcatsN", { n: L.showSubcats ? L.subList.length : L.all.length ? L.flat.length : L.list.length });
  const title = families ? t(L.all.length ? "csv.chooseSubcat" : "csv.chooseFamily") : L.showSubcats ? L.catRow?.name ?? "" : nav.searching ? t("csv.title") : nav.subcat || L.catRow?.name || "";
  return (
    <View style={s.col}>
      <CatalogHeader title={title} count={count} onNewDoc={onNewDoc} />
      {L.showSubcats && L.catRow?.description ? <Text variant="small" tone="gray">{L.catRow.description}</Text> : null}
      <FilterBar q={nav.q} onQ={nav.setQ} fields={filterFields(t, f, data.counts, L.sizeCounts, services)} dirty={f.dirty(services)} onReset={() => f.reset(services)} />
      {!families && !nav.searching && !pinned ? <BackRow onPress={nav.back} /> : null}
      {wait ? (
        [0, 1, 2].map((i) => <ServiceCardSkeleton key={i} />)
      ) : L.cats.isError || data.failed ? (
        <ErrorView error={L.cats.error ?? data.svc.error} onRetry={() => void (L.cats.isError ? L.cats.refetch() : data.svc.refetch())} compact />
      ) : services ? (
        <ServiceResults rows={data.shown} dl={dl} act={act} />
      ) : L.showSubcats ? (
        <CardGrid>{L.subList.map((r, i) => <SubcatCard key={r.name} name={r.name} count={r.n} index={i} samples={r.samples} onPress={() => open(nav.cat, r.name)} />)}</CardGrid>
      ) : L.all.length ? (
        <DirectionCards flat={L.flat} all={L.all.length} cats={L.list} fam={nav.fam} onFam={nav.setFam} perCat={L.perCat} totalServices={L.totalServices} onOpen={open} />
      ) : (
        <CategoryCards cats={L.list} onOpen={nav.setCat} />
      )}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 } });
