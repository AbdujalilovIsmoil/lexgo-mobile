import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { TEMPLATE_CATEGORIES, categoryKey, matchTemplates, shareTemplate, useTemplates, type Branch, type DocTemplate } from "@/entities/doc-template";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { PAGE, growWindow, nextCount } from "@/shared/lib/pageWindow";
import { useDebounced } from "@/shared/lib/useDebounced";
import { Button, EmptyState, ErrorView, Skeleton, Text, toast } from "@/shared/ui";
import { AdminPage, ChipBar } from "@/shared/ui/admin";
import { TemplateCard } from "./TemplateCard";
import { TemplateSearch } from "./TemplateSearch";
import { TemplateSheet } from "./TemplateSheet";

// /pro/templates — «Hujjatlar» of the lawyer's sidebar: the template catalogue as a PDF library. Branch chips, a roomy search, the
// cards ten at a time («Yana 10 ta» or scroll to the end), a details sheet and the PDF download.
export default function ProTemplatesPage() {
  const { t } = useT();
  const insets = useInsets();
  const [branch, setBranch] = useState<Branch>("all");
  const [text, setText] = useState("");
  const [open, setOpen] = useState<DocTemplate | null>(null);
  const [busy, setBusy] = useState("");
  const list = useTemplates(branch);
  const needle = useDebounced(text, 250);
  const rows = useMemo(() => matchTemplates(list.rows, needle), [list.rows, needle]);
  // The window of shown rows belongs to one (branch, search): another one starts again at the first ten.
  const key = `${branch}|${needle.trim().toLowerCase()}`;
  const [win, setWin] = useState({ key, n: PAGE });
  const n = Math.min(win.key === key ? win.n : PAGE, rows.length);
  const shown = rows.slice(0, n);
  const more = () => n < rows.length && setWin({ key, n: growWindow(n, rows.length) });

  const get = async (x: DocTemplate) => {
    if (busy) return;
    setBusy(x.id);
    try {
      await shareTemplate(x);
    } catch {
      toast(t("tpl.fail"), "err");
    } finally {
      setBusy("");
    }
  };

  const total = TEMPLATE_CATEGORIES.reduce((a, c) => a + (list.counts[c] ?? 0), 0);
  const allLoaded = TEMPLATE_CATEGORIES.every((c) => list.counts[c] !== null);
  const chips = [
    { value: "all" as Branch, label: t("tpl.all"), count: allLoaded ? total : undefined },
    ...TEMPLATE_CATEGORIES.map((c) => ({ value: c as Branch, label: t(categoryKey(c)), count: list.counts[c] ?? undefined })),
  ];
  const header = (
    <View style={s.head}>
      <View style={s.chips}><ChipBar options={chips} value={branch} onChange={setBranch} /></View>
      <View style={s.search}><TemplateSearch value={text} onChange={setText} found={rows.length} total={list.rows.length} /></View>
    </View>
  );
  const footer = (
    <View style={s.foot}>
      {rows.length > 0 ? <Text variant="caption" tone="gray">{t("tpl.counter", { n, total: rows.length })}</Text> : null}
      {n < rows.length ? <Button title={t("tpl.more", { n: nextCount(n, rows.length) })} variant="soft" size="sm" onPress={more} style={s.moreBtn} /> : null}
      {list.loadingMore ? <View style={s.loadingMore}><ActivityIndicator size="small" /><Text variant="caption" tone="gray">{t("tpl.loadingMore")}</Text></View> : null}
    </View>
  );
  return (
    <AdminPage title={t("lsb.documents")} subtitle={allLoaded && branch === "all" ? t("tpl.leadCount", { n: total }) : t("tpl.lead")}>
      {list.error ? (
        <ErrorView error={list.error} onRetry={list.refetch} />
      ) : (
        <FlatList
          data={list.loading ? [] : shown}
          keyExtractor={(x) => x.id}
          ListHeaderComponent={header}
          ListEmptyComponent={list.loading ? <View style={s.skeletons}>{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={84} round={20} />)}</View> : <EmptyState icon="file-text" title={needle.trim() ? t("tpl.notFound") : t("tpl.empty")} text={needle.trim() ? t("tpl.notFoundText") : t("tpl.emptyText")} actionLabel={needle.trim() ? t("tpl.clear") : undefined} onAction={needle.trim() ? () => setText("") : undefined} />}
          ListFooterComponent={list.loading ? null : footer}
          ItemSeparatorComponent={() => <View style={s.gap} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          refreshing={list.refetching}
          onRefresh={list.refetch}
          onEndReachedThreshold={0.4}
          onEndReached={more}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <TemplateCard item={item} busy={busy === item.id} onOpen={() => setOpen(item)} onDownload={() => void get(item)} />}
        />
      )}
      <TemplateSheet item={open} busy={!!open && busy === open.id} onClose={() => setOpen(null)} onDownload={(x) => void get(x)} />
    </AdminPage>
  );
}

const s = StyleSheet.create({
  head: { gap: 12, paddingBottom: 14 },
  chips: { marginHorizontal: -16 },
  search: {},
  skeletons: { gap: 10 },
  gap: { height: 10 },
  foot: { alignItems: "center", gap: 10, paddingTop: 16 },
  moreBtn: { alignSelf: "center" },
  loadingMore: { flexDirection: "row", alignItems: "center", gap: 8 },
});
