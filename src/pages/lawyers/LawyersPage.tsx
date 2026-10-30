import { useEffect, useRef, useState } from "react";
import { Keyboard, type TextInput } from "react-native";
import { useRouter } from "expo-router";
import { activeFilterCount, useLawyerPages, usePromoBanners } from "@/entities/lawyer";
import { FilterSheet, useLawyerFilterStore, useRecentSearches, type Pick } from "@/features/lawyer-filter";
import { AiResults } from "@/widgets/ai-results";
import { LawyerResults } from "@/widgets/lawyer-results";
import { PromoRail } from "@/widgets/market-promo";
import { TabPage } from "@/widgets/tab-page";
import { useDebounced } from "@/shared/lib/useDebounced";
import { RA_FIELD, RA_OPENER, raOk, useRaControl, useRaPage } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { DirectoryTop } from "./DirectoryTop";
import { useMarketParams } from "./useMarketParams";

// Marketplace directory (web /portal/client/lawyers): one search field (names, areas, services — with Google-like suggestions while it is
// in use) and the filter button, chips for the type and the practice area, the "describe your problem" row that turns the field into the AI
// search, the paid banners, then the specialists as rows of one card. Remote assistance (`client.marketplace`): the field and the filter
// button are on the operator's map.
export function LawyersPage() {
  const { t } = useT();
  const router = useRouter();
  const { filters, set, reset, ai, aiQuery, setAi, runAi } = useLawyerFilterStore();
  const [text, setText] = useState(filters.q);
  const [aiText, setAiText] = useState(aiQuery);
  const [aiMode, setAiMode] = useState(ai);
  const [focused, setFocused] = useState(false);
  const [sheet, setSheet] = useState(false);
  const typed = useDebounced(text, 400);
  const input = useRef<TextInput>(null);
  const addRecent = useRecentSearches((s) => s.add);
  useMarketParams(setText, (v) => { setAiText(v); setAiMode(true); });
  useEffect(() => {
    if (!useLawyerFilterStore.getState().ai && typed !== useLawyerFilterStore.getState().filters.q) set({ q: typed });
  }, [typed, set]);
  useRaPage("client.marketplace");
  const searchRa = useRaControl({
    id: "marketplace.search",
    label: t("ra.el.search"),
    actions: RA_FIELD,
    state: (aiMode ? aiText : text).trim() ? "filled" : "empty",
    focus: () => input.current?.focus(),
    setValue: (v) => {
      (aiMode ? setAiText : setText)(v.slice(0, 200));
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
  // The rail holds banners only (GET /promotions/active?placement=banner, else the list's own `banners`); boosted sellers are TOP rows in the list.
  const live = usePromoBanners().data;
  const banners = live?.length ? live : (first?.banners ?? []);
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const calm = !filters.q && !activeFilterCount(filters) && !filters.area && filters.kind === "all";
  const done = () => { Keyboard.dismiss(); setFocused(false); };
  const askAi = (q: string) => { const v = q.trim(); if (!v) return; setAiMode(true); setAiText(v); runAi(v); addRecent(v); done(); };
  const pick = (p: Pick) => {
    if (p.kind === "lawyer") { done(); return open(p.id); }
    if (p.kind === "ai") return askAi(p.q);
    if (p.kind === "text") { setText(p.q); set({ q: p.q }); addRecent(p.q); return done(); }
    setText("");
    if (p.kind === "area") set({ q: "", area: p.key });
    else if (p.kind === "region") set({ q: "", region: p.key });
    else set({ q: "", service: p.id });
    done();
  };
  const submit = () => (aiMode ? askAi(aiText) : (addRecent(text), set({ q: text.trim() }), done()));
  const aiOff = () => { setAiMode(false); setAi(false); setAiText(""); };
  const header = (
    <DirectoryTop
      filters={filters}
      setFilters={set}
      text={aiMode ? aiText : text}
      onText={aiMode ? setAiText : setText}
      focused={focused}
      onFocus={setFocused}
      aiMode={aiMode}
      onAiMode={(v) => { if (v) { setAiMode(true); setTimeout(() => input.current?.focus(), 50); } else aiOff(); }}
      onSubmit={submit}
      onPick={pick}
      lawyers={items}
      activeCount={activeFilterCount(filters)}
      onFilters={() => setSheet(true)}
      promo={ai || !calm ? null : <PromoRail items={banners} onOpenSeller={open} compact />}
      section={calm ? t("mk1.dir.recommended") : t("mk1.dir.found", { n: first?.total ?? items.length })}
      field={searchRa}
      filtersField={filtersRa}
      inputRef={input}
    />
  );
  const clear = () => { reset(); setText(""); };
  return (
    <TabPage title={t("mk1.pageTitle")} subtitle={t("mk1.pageLead")}>
      {ai ? <AiResults header={header} onOpen={openServices} onExample={(x) => askAi(x)} onOff={aiOff} /> : <LawyerResults query={query} header={header} onOpen={open} onReset={clear} quiet={focused && !!text.trim()} />}
      <FilterSheet visible={sheet} onClose={() => setSheet(false)} />
    </TabPage>
  );
}
