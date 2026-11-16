import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, type TextInput } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { useFocusEffect, useRouter } from "expo-router";
import { activeFilterCount, useLawyerPages, usePromoBanners } from "@/entities/lawyer";
import { FilterSheet, SearchSuggest, useLawyerFilterStore, useRecentSearches, type Pick } from "@/features/lawyer-filter";
import { AiResults } from "@/widgets/ai-results";
import { LawyerResults } from "@/widgets/lawyer-results";
import { PromoRail } from "@/widgets/market-promo";
import { useTabOverlay } from "@/widgets/tab-bar/tabOverlay";
import { HOME_BG } from "@/widgets/client-dash";
import { TabPage } from "@/widgets/tab-page";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useAiFabAction } from "@/shared/lib/aiFabAway";
import { RA_FIELD, RA_OPENER, raOk, useRaControl, useRaPage } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { useTheme } from "@/shared/theme";
// import { IconButton } from "@/shared/ui"; // the header map button is off for now
import { HeaderRight } from "@/shared/ui/headerExtra";
// import { useIsAuthed } from "@/entities/session"; // the header map button is off for now
import { DirectoryBar, DirectoryHead } from "./DirectoryTop";
import { useMarketParams } from "./useMarketParams";

// Marketplace directory (web /portal/client/lawyers): one search field (names, areas, services — with Google-like suggestions while it is
// in use) and the filter button, chips for the type and the practice area, the "describe your problem" row that turns the field into the AI
// search, the paid banners, then the specialists as rows of one card. Remote assistance (`client.marketplace`): the field and the filter
// button are on the operator's map.
export function LawyersPage() {
  const { t } = useT();
  const router = useRouter();
  // const authed = useIsAuthed(); // only the (commented out) header map button used it
  const { dark } = useTheme();
  const { filters, set, reset, ai, aiQuery, setAi, runAi } = useLawyerFilterStore();
  const [text, setText] = useState(filters.q);
  const [aiText, setAiText] = useState(aiQuery);
  const [aiMode, setAiMode] = useState(ai);
  const [focused, setFocused] = useState(false);
  const [sheet, setSheet] = useState(false);
  const typed = useDebounced(text, 400);
  const input = useRef<TextInput>(null);
  const addRecent = useRecentSearches((s) => s.add);
  const recentCount = useRecentSearches((s) => s.items.length);
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
  const exit = () => { if (aiMode) setAiText(""); else { setText(""); set({ q: "" }); } done(); input.current?.blur(); };
  const bar = (
    <DirectoryBar
      filters={filters}
      setFilters={set}
      text={aiMode ? aiText : text}
      onText={aiMode ? setAiText : setText}
      focused={focused}
      onFocus={setFocused}
      aiMode={aiMode}
      onAiMode={(v) => { if (v) { setAiMode(true); setTimeout(() => input.current?.focus(), 50); } else aiOff(); }}
      onSubmit={submit}
      onExit={exit}
      activeCount={activeFilterCount(filters)}
      onFilters={() => setSheet(true)}
      field={searchRa}
      filtersField={filtersRa}
      inputRef={input}
    />
  );
  const startAi = () => { setAiMode(true); setTimeout(() => input.current?.focus(), 80); };
  // Here the floating AI button is "Muammoingizni yozing": it turns the field into the AI search (same look, same leave-on-scroll).
  const setFab = useAiFabAction((x) => x.set);
  const fabLabel = t("mk1.dir.fabT");
  const fabSub = t("mk1.dir.fabSub");
  useFocusEffect(useCallback(() => {
    setFab(startAi, fabLabel, fabSub);
    return () => setFab(null);
  }, [setFab, fabLabel, fabSub]));
  const header = ai ? <></> : (
    <DirectoryHead
      promo={!calm ? null : <PromoRail items={banners} onOpenSeller={open} compact />}
      section={calm ? t("mk1.dir.recommended") : t("mk1.dir.found", { n: first?.total ?? items.length })}
    />
  );
  // The type switch slides the list in from the side it was picked on, as a swipe would (the bar above stays still).
  const order = ["all", "advokat", "yurist"];
  const [slide, setSlide] = useState({ kind: filters.kind, dir: 1, moved: false });
  if (slide.kind !== filters.kind) setSlide({ kind: filters.kind, dir: order.indexOf(filters.kind) >= order.indexOf(slide.kind) ? 1 : -1, moved: true });
  const clear = () => { reset(); setText(""); };
  // iOS opens this page over the open tab (tabOverlay): going back closes it. Elsewhere it is a screen of its own.
  const back = () => {
    const over = useTabOverlay.getState();
    if (over.name) over.close();
    else if (router.canGoBack()) router.back();
    else router.replace("/");
  };
  return (
    <TabPage secondary onBack={back} ground={dark ? undefined : HOME_BG} title={t("mk1.pageTitle")} subtitle={t("mk1.headLead")} right={<>{/* The map button is off for now: <IconButton icon="map" label={t("mmap.entry")} onPress={() => router.push((authed ? "/nearby" : "/auth/login") as never)} /> */}<HeaderRight /></>}>
      {bar}
      {/* The suggestions take the list's place only when there is something to suggest (a typed word or recent searches) — an empty field
          keeps the list in view instead of a blank page. */}
      {focused && !ai && (!!text.trim() || recentCount > 0) ? (
        <ScrollView style={st.fill} contentContainerStyle={st.suggest} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
          <SearchSuggest text={text} lawyers={items} onPick={pick} />
        </ScrollView>
      ) : (
        <Animated.View key={`${slide.kind}${ai ? "-ai" : ""}`} entering={slide.moved ? slideIn(slide.dir) : undefined} style={st.fill}>
          {ai ? <AiResults header={header} onOpen={openServices} onExample={(x) => askAi(x)} onOff={aiOff} /> : <LawyerResults query={query} header={header} onOpen={open} onReset={clear} />}
        </Animated.View>
      )}
      <FilterSheet visible={sheet} onClose={() => setSheet(false)} />
    </TabPage>
  );
}

// A list coming in from the right (dir 1) or the left (-1): a short slide with a fade, like the end of a swipe.
const slideIn = (dir: number) => new Keyframe({
  0: { opacity: 0.2, transform: [{ translateX: dir * 120 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: Easing.out(Easing.cubic) },
}).duration(260);

const st = StyleSheet.create({ fill: { flex: 1 }, suggest: { paddingTop: 4, paddingBottom: 120 } });
