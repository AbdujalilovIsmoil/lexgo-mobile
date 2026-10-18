import { FlatList, StyleSheet, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MarketOrderCard, MarketOrderSkeleton, OrderRow } from "@/entities/order";
import { EmptyState, ErrorView } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useTabHeader } from "@/widgets/tab-page";
import { OrdersFilterBar } from "./OrdersFilterBar";
import { useMyOrders } from "./useMyOrders";

// Client "My orders": search with a filter sheet (status, sort), one card per purchase or service order.
export function MyOrders() {
  const { t } = useT();
  const router = useRouter();
  const pad = useInsets().bottom + 120; // clears the floating tab bar
  const m = useMyOrders();
  const [pulling, setPulling] = useState(false);
  const top = useTabHeader(16);
  const open = (id: string) => router.push({ pathname: "/orders/[id]", params: { id } });
  if (!m.authed) return <View>{top}<EmptyState icon="lock" title={t("mk4.loginTitle")} text={t("mk4.loginText")} actionLabel={t("auth.submit")} onAction={() => router.push("/auth/login")} /></View>;
  if (m.error && !m.entries.length) return <View>{top}<ErrorView error={m.error} onRetry={m.refetch} /></View>;
  const header = <View>{top}<OrdersFilterBar m={m} /></View>;
  const empty = m.loading ? <View style={s.gap}>{[0, 1, 2].map((i) => <MarketOrderSkeleton key={i} />)}</View>
    : m.entries.length ? <EmptyState icon="filter" title={t("mk4.emptyFilter")} compact />
    : <EmptyState icon="shopping-bag" title={t("mk4.empty")} text={t("mk4.emptyText")} actionLabel={t("mk4.browse")} onAction={() => router.push("/(tabs)/lawyers")} />;
  return (
    <FlatList
      data={m.loading ? [] : m.shown}
      keyExtractor={(e) => e.key}
      renderItem={({ item }) => item.kind === "market" ? <MarketOrderCard order={item.order} onPress={() => open(item.order.id)} /> : <OrderRow order={item.order} onPress={() => open(item.order.id)} />}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: pad }}
      refreshing={pulling}
      onRefresh={() => { setPulling(true); m.refetch(); setTimeout(() => setPulling(false), 800); }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  sep: { height: 10 },
  gap: { gap: 10 },
});
