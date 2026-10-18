import { useMemo, useState, type ReactElement } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { applyProFilters, useAssigned, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { cap } from "@/shared/lib/pro/cap";
import { useColors } from "@/shared/theme";
import { Chip, EmptyState, ErrorView, IconButton, Skeleton, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { Fade } from "./Fade";
import { ProCard } from "./ProCard";
import { ProFilterSheet } from "./ProFilterSheet";
import { useProFilters } from "./useProFilters";

// "Tezkor ishlar": the advocate's urgent jobs. Search and one round filter button (badge when something is on) in a row, the active
// choices as removable chips, the count with a live dot, then urgency-first cards; pull to refresh, skeleton, error, two empty states.
export function ProFeed({ header }: { header?: ReactElement }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const label = useUrgentLabels();
  const q = useAssigned();
  const m = useProFilters();
  const [sheet, setSheet] = useState(false);
  const all = useMemo(() => q.data ?? [], [q.data]);
  const rows = useMemo(() => applyProFilters(all, m.f), [all, m.f]);
  const f = m.f;
  const chips = [
    ...(f.status ? [{ key: "status", label: label.status(f.status), off: () => m.set({ status: "" }) }] : []),
    ...(f.period !== "all" ? [{ key: "period", label: t(`ugx.period${cap(f.period)}`), off: () => m.set({ period: "all" }) }] : []),
    ...(f.sort !== "attention" ? [{ key: "sort", label: t(`ugx.sort${cap(f.sort)}`), off: () => m.set({ sort: "attention" }) }] : []),
  ];
  const head = (
    <View style={s.head}>
      {header}
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={f.q} onChangeText={(v) => m.set({ q: v })} placeholder={t("ugx.search")} /></View>
        <IconButton icon="sliders" label={t("ugx.filters")} badge={m.active > 0} onPress={() => setSheet(true)} />
      </View>
      {chips.length ? <View style={s.chips}>{chips.map((x) => <Chip key={x.key} label={x.label} active icon="x" onPress={x.off} />)}</View> : null}
      <View style={s.count}>
        <Text variant="small" weight="bold" tone="gray">{t("ugx.count", { n: rows.length })}</Text>
        <View style={s.live}><View style={[s.dot, { backgroundColor: c.ok }]} /><Text variant="caption" tone="gray">{t("ugx.live")}</Text></View>
      </View>
    </View>
  );
  const empty = q.isLoading ? <View style={s.sk}>{[0, 1, 2].map((i) => <Skeleton key={i} height={250} round={20} />)}</View>
    : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
    : all.length ? <EmptyState icon="search" title={t("ugx.noMatch")} text={t("ugx.noMatchText")} actionLabel={t("ugx.clearAll")} onAction={m.clear} />
    : <EmptyState icon="zap" title={t("ugx.empty")} text={t("ugx.emptyText")} />;
  return (
    <>
      <FlatList<UrgentRequest>
        data={q.isLoading ? [] : rows}
        keyExtractor={(r) => r.id}
        renderItem={({ item, index }) => <Fade i={index}><ProCard req={item} /></Fade>}
        ListHeaderComponent={head}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={s.gap} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28, flexGrow: 1 }}
        refreshing={q.isRefetching}
        onRefresh={() => void q.refetch()}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <ProFilterSheet m={m} rows={all} shown={rows.length} visible={sheet} onClose={() => setSheet(false)} />
    </>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: 12, paddingBottom: 14 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: -16, paddingRight: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  count: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  gap: { height: 14 },
  sk: { gap: 14 },
});
