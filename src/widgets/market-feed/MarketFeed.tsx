import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { applyFilters, useJobs, type Job } from "@/entities/market-feed";
import { useCabinet } from "@/entities/pro-onboarding";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { Chip, EmptyState, ErrorView, Icon, IconButton, Skeleton, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { JobCard } from "./JobCard";
import { MarketFilterSheet } from "./MarketFilterSheet";
import { useMarketFilters } from "./useMarketFilters";

// "Ishlar bozori": the live feed of open orders. Search and one filter button (with a badge) in a single row, the active choices as
// removable chips, the count with a live dot, then the cards; pull to refresh, skeleton, error and two kinds of empty state.
export function MarketFeed() {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const q = useJobs();
  const limited = !!useCabinet().data?.limitedAccess;
  const m = useMarketFilters();
  const [sheet, setSheet] = useState(false);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const all = useMemo(() => (q.data ?? []).filter((j) => !gone.has(j.id)), [q.data, gone]);
  const rows = useMemo(() => applyFilters(all, m.f), [all, m.f]);
  const f = m.f;
  const chips: { key: string; label: string; off: () => void }[] = [
    ...(f.region ? [{ key: "region", label: f.region, off: () => m.set({ region: "" }) }] : []),
    ...(f.budget !== "any" ? [{ key: "budget", label: t(`mkt.budget${f.budget[0].toUpperCase()}${f.budget.slice(1)}`), off: () => m.set({ budget: "any" }) }] : []),
    ...(f.when !== "all" ? [{ key: "when", label: t(`mkt.when${f.when[0].toUpperCase()}${f.when.slice(1)}`), off: () => m.set({ when: "all" }) }] : []),
    ...(f.sort !== "new" ? [{ key: "sort", label: t(`mkt.sort${f.sort[0].toUpperCase()}${f.sort.slice(1)}`), off: () => m.set({ sort: "new" }) }] : []),
  ];
  const header = (
    <View style={s.head}>
      {limited ? <View style={[s.note, { backgroundColor: c.warnBg }]}><Icon name="lock" size={15} color={c.warn} /><Text variant="small" style={[s.flex, { color: c.warn }]}>{t("mkt.pending")}</Text></View> : null}
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={f.q} onChangeText={(v) => m.set({ q: v })} placeholder={t("mkt.search")} /></View>
        <IconButton icon="sliders" label={t("mkt.filters")} badge={m.active > 0} onPress={() => setSheet(true)} />
      </View>
      {chips.length ? <View style={s.chips}>{chips.map((x) => <Chip key={x.key} label={x.label} active icon="x" onPress={x.off} />)}</View> : null}
      <View style={s.count}>
        <Text variant="small" weight="bold" tone="gray">{t("mkt.count", { n: rows.length })}</Text>
        <View style={s.live}><View style={[s.dot, { backgroundColor: c.ok }]} /><Text variant="caption" tone="gray">{t("mkt.live")}</Text></View>
      </View>
    </View>
  );
  const empty = q.isLoading ? <View style={s.sk}>{[0, 1, 2].map((i) => <Skeleton key={i} height={170} round={20} />)}</View>
    : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
    : all.length ? <EmptyState icon="search" title={t("mkt.noMatch")} text={t("mkt.noMatchText")} actionLabel={t("mkt.clearAll")} onAction={m.clear} />
    : <EmptyState icon="briefcase" title={t("mkt.empty")} text={t("mkt.emptyText")} />;
  return (
    <>
      <FlatList<Job>
        data={q.isLoading ? [] : rows}
        keyExtractor={(j) => j.id}
        renderItem={({ item }) => <JobCard job={item} blocked={limited} onGone={(id) => setGone((g) => new Set(g).add(id))} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={s.gap} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28, flexGrow: 1 }}
        refreshing={q.isRefetching}
        onRefresh={() => void q.refetch()}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <MarketFilterSheet m={m} jobs={all} shown={rows.length} visible={sheet} onClose={() => setSheet(false)} />
    </>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: 12, paddingBottom: 14 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 14 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: -16, paddingRight: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  count: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  gap: { height: 12 },
  sk: { gap: 12 },
});
