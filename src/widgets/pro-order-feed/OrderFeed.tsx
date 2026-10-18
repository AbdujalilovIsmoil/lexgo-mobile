import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { applyOrderFilters, forSeller, useOrderLive, useProOrders, type ProOrder } from "@/entities/pro-order";
import { useCabinet } from "@/entities/pro-onboarding";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { cap } from "@/shared/lib/pro/cap";
import { useColors } from "@/shared/theme";
import { Chip, EmptyState, ErrorView, IconButton, Skeleton, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { OrderCard } from "./OrderCard";
import { OrderFilterSheet } from "./OrderFilterSheet";
import { useOrderFilters } from "./useOrderFilters";

// "Xizmat buyurtmalari": the seller's paid orders, live. Search and one filter button (with a badge), the active choices as removable
// chips, the count with a live dot, then the cards; pull to refresh, skeleton, error and two kinds of empty state.
export function OrderFeed() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const insets = useInsets();
  const q = useProOrders();
  const limited = !!useCabinet().data?.limitedAccess;
  const m = useOrderFilters();
  const [sheet, setSheet] = useState(false);
  useOrderLive();
  const all = useMemo(() => forSeller(q.data ?? []), [q.data]);
  const rows = useMemo(() => applyOrderFilters(all, m.f), [all, m.f]);
  const f = m.f;
  const chips: { key: string; label: string; off: () => void }[] = [
    ...(f.stage !== "all" ? [{ key: "stage", label: t(`sl9.tab.${f.stage}`), off: () => m.set({ stage: "all" }) }] : []),
    ...(f.price !== "any" ? [{ key: "price", label: t(`pof.chipPrice${cap(f.price)}`), off: () => m.set({ price: "any" }) }] : []),
    ...(f.when !== "all" ? [{ key: "when", label: t(`pof.chipWhen${cap(f.when)}`), off: () => m.set({ when: "all" }) }] : []),
    ...(f.sort !== "new" ? [{ key: "sort", label: t(`pof.sort${cap(f.sort)}`), off: () => m.set({ sort: "new" }) }] : []),
  ];
  const header = (
    <View style={s.head}>
      {limited ? <Notice tone="warn" text={t("sl9.limited")} /> : null}
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={f.q} onChangeText={(v) => m.set({ q: v })} placeholder={t("pof.search")} /></View>
        <IconButton icon="sliders" label={t("pof.filters")} badge={m.active > 0} onPress={() => setSheet(true)} />
      </View>
      {chips.length ? <View style={s.chips}>{chips.map((x) => <Chip key={x.key} label={x.label} active icon="x" onPress={x.off} />)}</View> : null}
      <View style={s.count}>
        <Text variant="small" weight="bold" tone="gray">{t("pof.count", { n: rows.length })}</Text>
        <View style={s.live}><View style={[s.dot, { backgroundColor: c.ok }]} /><Text variant="caption" tone="gray">{t("pof.live")}</Text></View>
      </View>
    </View>
  );
  const empty = q.isLoading ? <View style={s.sk}>{[0, 1, 2].map((i) => <Skeleton key={i} height={130} round={20} />)}</View>
    : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} />
    : all.length ? <EmptyState icon="search" title={t("pof.noMatch")} text={t("pof.noMatchText")} actionLabel={t("pof.clearAll")} onAction={m.clear} />
    : <EmptyState icon="shopping-bag" title={t("pof.empty")} text={t("pof.emptyText")} />;
  return (
    <>
      <FlatList<ProOrder>
        data={q.isLoading ? [] : rows}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => router.push({ pathname: "/pro/orders/[id]", params: { id: item.id } } as never)} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={s.gap} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28, flexGrow: 1 }}
        refreshing={q.isRefetching}
        onRefresh={() => void q.refetch()}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <OrderFilterSheet m={m} orders={all} shown={rows.length} visible={sheet} onClose={() => setSheet(false)} />
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
  gap: { height: 12 },
  sk: { gap: 12 },
});
