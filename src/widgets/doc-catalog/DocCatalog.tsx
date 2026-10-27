import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View, type TextInput } from "react-native";
import { useRouter } from "expo-router";
import { matchTemplates, useCatalogTemplates, useTemplateCategories, type DocTemplate } from "@/entities/doc-template";
import { isOfflineError } from "@/shared/api";
import { trackDoc } from "@/shared/analytics";
import { PAGE, growWindow, nextCount } from "@/shared/lib/pageWindow";
import { useDebounced } from "@/shared/lib/useDebounced";
import { RA_FIELD, RA_OPENER, raOk, useRaControl } from "@/shared/remote-assist";
import { Button, EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useTabClearance, useTabHeader } from "@/widgets/tab-page";
import { CatalogFilterSheet } from "./CatalogFilterSheet";
import { CatalogRow } from "./CatalogRow";
import { CatalogSearch } from "./CatalogSearch";
import { boilerplate, categoryLabel, languageLabel } from "./labels";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";

const SEARCH = { kind: "search" } as const;
type Item = typeof SEARCH | DocTemplate;

// The ready-documents catalogue (README): the page IS the catalogue — search pinned on top, a category / language sheet, the documents ten
// at a time, and an explained state for loading, an empty category, no search match, an error and being offline. `top` (the AI-intake and urgent-advocate cards) sits above the search, `footer` closes the list. The search field is the list's first row, kept on screen by `stickyHeaderIndices`.
export function DocCatalog({ top: cards, footer, onOpen }: { top?: ReactElement | null; footer?: ReactElement | null; onOpen?: (t: DocTemplate) => void }) {
  const { t } = useT();
  const router = useRouter();
  const top = useTabHeader(16);
  const clearance = useTabClearance();
  const cats = useTemplateCategories();
  const [cat, setCat] = useState("");
  const [lang, setLang] = useState("");
  const [text, setText] = useState("");
  const [sheet, setSheet] = useState(false);
  const input = useRef<TextInput>(null);
  // Remote assistance: the search field and the category / language sheet are on the operator's map.
  const searchRa = useRaControl({
    id: "documents.search",
    label: t("ra.el.docSearch"),
    actions: RA_FIELD,
    state: text.trim() ? "filled" : "empty",
    focus: () => input.current?.focus(),
    setValue: (v) => {
      setText(v.slice(0, 200));
      return raOk();
    },
  });
  const filtersRa = useRaControl({
    id: "documents.filters",
    label: t("ra.el.catalogFilters"),
    actions: RA_OPENER,
    state: sheet ? "selected" : "ready",
    open: () => {
      setSheet(true);
      return raOk();
    },
  });
  const list = useCatalogTemplates(cat);
  const pull = usePullRefresh(list.refetch);
  const needle = useDebounced(text, 300);
  const info = useMemo(() => cats.data ?? [], [cats.data]);
  const languages = useMemo(() => [...new Set([...info.flatMap((c) => c.languages), ...list.rows.map((r) => r.language)].filter(Boolean))], [info, list.rows]);
  const plain = useMemo(() => boilerplate(list.rows.map((r) => r.description.trim())), [list.rows]); // sentences many documents share
  const byLang = useMemo(() => (lang ? list.rows.filter((r) => r.language === lang) : list.rows), [list.rows, lang]);
  const rows = useMemo(() => matchTemplates(byLang, needle), [byLang, needle]);
  // The window of shown rows belongs to one (category, language, search): another one starts again at the first ten.
  const key = `${cat}|${lang}|${needle.trim()}`;
  const [win, setWin] = useState({ key, n: PAGE });
  const n = Math.min(win.key === key ? win.n : PAGE, rows.length);
  const shown = rows.slice(0, n);
  const more = () => n < rows.length && setWin({ key, n: growWindow(n, rows.length) });
  const active = (cat ? 1 : 0) + (lang ? 1 : 0);
  const chips = [
    ...(cat ? [{ key: "cat", label: categoryLabel(t, cat, info.find((c) => c.key === cat)?.title), clear: () => setCat("") }] : []),
    ...(lang ? [{ key: "lang", label: languageLabel(t, lang), clear: () => setLang("") }] : []),
  ];
  const total = cat ? info.find((c) => c.key === cat)?.count ?? list.rows.length : info.reduce((a, c) => a + c.count, 0) || list.rows.length;
  const line = list.loading || list.error ? "" : needle.trim() || lang ? t("dcat.countOf", { n: rows.length, total: total || byLang.length }) : t("dcat.count", { n: total || rows.length });
  const reset = () => { setCat(""); setLang(""); };
  // Analytics (no text, no ids): the catalogue opened once; a search once per settled query.
  useEffect(() => { trackDoc("document_catalog_opened"); }, []);
  const searched = useRef("");
  useEffect(() => {
    const q = needle.trim();
    if (q.length >= 2 && q !== searched.current) { searched.current = q; trackDoc("document_template_searched", { category: cat || undefined, language: lang || undefined }); }
    if (!q) searched.current = "";
  }, [needle, cat, lang]);

  const state = list.loading ? (
    <View style={s.skeletons}>{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={92} round={20} />)}</View>
  ) : list.error ? (
    isOfflineError(list.error) ? <EmptyState icon="wifi-off" title={t("dcat.offline")} text={t("dcat.offlineText")} actionLabel={t("common.retry")} onAction={list.refetch} /> : <ErrorView error={list.error} onRetry={list.refetch} />
  ) : !rows.length ? (
    needle.trim()
      ? <EmptyState icon="search" title={t("dcat.noMatch")} text={t("dcat.noMatchText", { q: text.trim() })} actionLabel={t("dcat.clearSearch")} onAction={() => setText("")} />
      : <EmptyState icon="file-text" title={t("dcat.noneInCategory")} actionLabel={t("dcat.clearCategory")} onAction={reset} />
  ) : null;
  const foot = (
    <View style={s.foot}>
      {state}
      {rows.length > 0 ? <Text variant="caption" tone="gray">{t("tpl.counter", { n, total: rows.length })}</Text> : null}
      {n < rows.length ? <Button title={t("tpl.more", { n: nextCount(n, rows.length) })} variant="soft" size="sm" onPress={more} /> : null}
      {list.loadingMore && !list.loading ? <View style={s.loadingMore}><ActivityIndicator size="small" /><Text variant="caption" tone="gray">{t("dcat.loadingMore")}</Text></View> : null}
      {footer}
    </View>
  );
  const open = (x: DocTemplate) => (onOpen ? onOpen(x) : router.push(`/templates/${x.id}` as never));
  return (
    <>
      <FlatList<Item>
        data={[SEARCH, ...(list.loading || list.error ? [] : shown)]}
        keyExtractor={(x) => ("kind" in x ? "search" : x.id)}
        stickyHeaderIndices={[1]}
        ListHeaderComponent={<>{top}{cards ? <View style={s.cards}>{cards}</View> : null}</>}
        ListFooterComponent={foot}
        ItemSeparatorComponent={Sep}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: clearance }}
        refreshing={pull.refreshing}
        onRefresh={pull.onRefresh}
        onEndReachedThreshold={0.4}
        onEndReached={more}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => "kind" in item
          ? <CatalogSearch value={text} onChange={setText} onFilters={() => setSheet(true)} active={active} chips={chips} line={line} field={searchRa} filters={filtersRa} inputRef={input} />
          : <CatalogRow item={item} cats={info} onOpen={() => open(item)} showLang={languages.length > 1} plain={plain} />}
      />
      <CatalogFilterSheet visible={sheet} onClose={() => setSheet(false)} cats={info} keys={list.keys} languages={languages} cat={cat} lang={lang} onCat={setCat} onLang={setLang} onReset={reset} total={rows.length} />
    </>
  );
}

const Sep = () => <View style={s.gap} />;
const s = StyleSheet.create({
  cards: { paddingTop: 4, paddingBottom: 8 },
  skeletons: { gap: 10, alignSelf: "stretch" },
  gap: { height: 10 },
  foot: { alignItems: "center", gap: 10, paddingTop: 16 },
  loadingMore: { flexDirection: "row", alignItems: "center", gap: 8 },
});
