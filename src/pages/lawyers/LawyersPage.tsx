import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { activeFilterCount, useLawyerPages, usePromoActive, type PromoSurface } from "@/entities/lawyer";
import { ActiveFilters, FilterButton, FilterSheet, MarketHero, useLawyerFilterStore } from "@/features/lawyer-filter";
import { AiResults } from "@/widgets/ai-results";
import { LawyerResults } from "@/widgets/lawyer-results";
import { PromoRail } from "@/widgets/market-promo";
import { MarketShowcase } from "@/widgets/market-showcase";
import { TabPage } from "@/widgets/tab-page";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { useMarketParams } from "./useMarketParams";

// Marketplace directory (web /portal/client/lawyers): the hero with the AI search ("Topish") and examples, name
// search (debounced, sent to the server), the filter bar, paid placements, "picked for you", counters, result cards.
export function LawyersPage() {
  const { t } = useT();
  const router = useRouter();
  const { filters, set, reset, ai, aiQuery, setAi, runAi } = useLawyerFilterStore();
  const [text, setText] = useState(filters.q);
  const [aiText, setAiText] = useState(aiQuery);
  const [sheet, setSheet] = useState(false);
  const typed = useDebounced(text, 400);
  useMarketParams(setText, setAiText);
  useEffect(() => {
    if (!useLawyerFilterStore.getState().ai && typed !== useLawyerFilterStore.getState().filters.q) set({ q: typed });
  }, [typed, set]);
  const query = useLawyerPages(filters);
  const open = (id: string) => router.push({ pathname: "/specialist/[id]", params: { id } });
  const openServices = (id: string) => router.push({ pathname: "/specialist/[id]", params: { id, tab: "services" } }); // AI hits: straight to what he sells
  const first = query.data?.pages[0];
  const active = usePromoActive().data;
  const promos: PromoSurface[] = active?.length ? active : [...(first?.banners ?? []), ...(first?.sponsored ?? [])];
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const prices = items.map((l) => l.basePrice).filter((p) => p > 0);
  const stats = { sellers: first?.total ?? items.length, services: new Set(items.flatMap((l) => l.services.map((x) => x.id))).size, min: prices.length ? Math.min(...prices) : 0, loading: query.isPending };
  const calm = !filters.q && !activeFilterCount(filters) && !filters.area;
  const header = (
    <View style={s.head}>
      {ai || !calm ? null : <PromoRail items={promos} onOpenSeller={open} />}
      <MarketHero value={ai ? aiText : text} onChange={ai ? setAiText : setText} onFind={() => { const v = (ai ? aiText : text).trim(); if (v) { setAiText(v); runAi(v); } }} onClear={() => { setText(""); setAiText(""); setAi(false); }} onExample={(x) => { setText(x); setAiText(x); runAi(x); }} stats={stats}>
        {ai || !calm ? null : <MarketShowcase items={items} onOpen={open} />}
      </MarketHero>
      <FilterButton activeCount={activeFilterCount(filters)} onPress={() => setSheet(true)} />
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
