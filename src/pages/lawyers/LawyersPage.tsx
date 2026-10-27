import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, type TextInput } from "react-native";
import { useRouter } from "expo-router";
import { activeFilterCount, useLawyerPages, usePromoBanners } from "@/entities/lawyer";
import { ActiveFilters, FilterButton, FilterSheet, MarketHero, useLawyerFilterStore } from "@/features/lawyer-filter";
import { AiResults } from "@/widgets/ai-results";
import { LawyerResults } from "@/widgets/lawyer-results";
import { PromoRail } from "@/widgets/market-promo";
import { MarketShowcase } from "@/widgets/market-showcase";
import { TabPage } from "@/widgets/tab-page";
import { useDebounced } from "@/shared/lib/useDebounced";
import { RA_FIELD, RA_OPENER, raOk, useRaControl, useRaPage } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { useMarketParams } from "./useMarketParams";

// Marketplace directory (web /portal/client/lawyers): the hero with the AI search ("Topish") and examples, name
// search (debounced, sent to the server), the filter bar, paid placements, "picked for you", counters, result cards.
// Remote assistance (`client.marketplace`): the search pill and the filter button are on the operator's map.
export function LawyersPage() {
  const { t } = useT();
  const router = useRouter();
  const { filters, set, reset, ai, aiQuery, setAi, runAi } = useLawyerFilterStore();
  const [text, setText] = useState(filters.q);
  const [aiText, setAiText] = useState(aiQuery);
  const [sheet, setSheet] = useState(false);
  const typed = useDebounced(text, 400);
  const input = useRef<TextInput>(null);
  useMarketParams(setText, setAiText);
  useEffect(() => {
    if (!useLawyerFilterStore.getState().ai && typed !== useLawyerFilterStore.getState().filters.q) set({ q: typed });
  }, [typed, set]);
  useRaPage("client.marketplace");
  const searchRa = useRaControl({
    id: "marketplace.search",
    label: t("ra.el.search"),
    actions: RA_FIELD,
    state: (ai ? aiText : text).trim() ? "filled" : "empty",
    focus: () => input.current?.focus(),
    setValue: (v) => {
      (ai ? setAiText : setText)(v.slice(0, 200));
      return raOk();
    },
  });
  const filtersRa = useRaControl({
    id: "marketplace.filters",
    label: t("ra.el.filters"),
    actions: RA_OPENER,
    state: sheet ? "selected" : "ready",
    open: () => {
      setSheet(true);
      return raOk();
    },
  });
  const query = useLawyerPages(filters);
  const open = (id: string) => router.push({ pathname: "/specialist/[id]", params: { id } });
  const openServices = (id: string) => router.push({ pathname: "/specialist/[id]", params: { id, tab: "services" } }); // AI hits: straight to what he sells
  const first = query.data?.pages[0];
  // The rail holds banners only (GET /promotions/active?placement=banner, else the list's own `banners`); boosted sellers are TOP cards in the list.
  const live = usePromoBanners().data;
  const banners = live?.length ? live : (first?.banners ?? []);
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const prices = items.map((l) => l.basePrice).filter((p) => p > 0);
  const stats = { sellers: first?.total ?? items.length, services: new Set(items.flatMap((l) => l.services.map((x) => x.id))).size, min: prices.length ? Math.min(...prices) : 0, loading: query.isPending };
  const calm = !filters.q && !activeFilterCount(filters) && !filters.area;
  const header = (
    <View style={s.head}>
      {ai || !calm ? null : <PromoRail items={banners} onOpenSeller={open} />}
      <MarketHero field={searchRa} inputRef={input} value={ai ? aiText : text} onChange={ai ? setAiText : setText} onFind={() => { const v = (ai ? aiText : text).trim(); if (v) { setAiText(v); runAi(v); } }} onClear={() => { setText(""); setAiText(""); setAi(false); }} onExample={(x) => { setText(x); setAiText(x); runAi(x); }} stats={stats}>
        {ai || !calm ? null : <MarketShowcase items={items} onOpen={open} />}
      </MarketHero>
      <View {...filtersRa}><FilterButton activeCount={activeFilterCount(filters)} onPress={() => setSheet(true)} /></View>
      <ActiveFilters />
    </View>
  );
  const clear = () => { reset(); setText(""); };
  return (
    <TabPage title={t("mk1.pageTitle")} subtitle={t("mk1.pageLead")}>
      {ai ? <AiResults header={header} onOpen={openServices} onExample={(x) => { setAiText(x); runAi(x); }} onOff={() => setAi(false)} /> : <LawyerResults query={query} header={header} onOpen={open} onReset={clear} />}
      <FilterSheet visible={sheet} onClose={() => setSheet(false)} />
    </TabPage>
  );
}

const s = StyleSheet.create({
  head: { gap: 12, marginHorizontal: -16 },
});
