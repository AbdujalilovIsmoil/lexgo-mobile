import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";
import { OrderRow, OrderRowSkeleton, type Order } from "@/entities/order";
import { OrderSheet } from "@/widgets/order-sheet";
import { EmptyState, ErrorView, Text, type IconName } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";

type Props = {
  title: string;
  lead: string;
  query: UseQueryResult<Order[]>;
  emptyIcon: IconName;
  emptyTitle: string;
  emptyText: string;
  actionLabel?: string;
  onAction?: () => void;
};

// Tab page with a big title above a list of orders. Shared by the client's
// "Orders" and the seller's "Jobs" / "My work" tabs.
export function OrderList({ title, lead, query, emptyIcon, emptyTitle, emptyText, actionLabel, onAction }: Props) {
  const c = useColors();
  const insets = useInsets();
  const { data, isLoading, error, refetch, isRefetching } = query;
  const [open, setOpen] = useState<Order | null>(null);
  return (
    <View style={[s.fill, { backgroundColor: c.bg, paddingTop: insets.top + 12 }]}>
      <View style={s.head}>
        <Text variant="h2">{title}</Text>
        <Text variant="small" tone="gray">{lead}</Text>
      </View>
      {error ? (
        <ErrorView error={error} onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(o) => o.id || o.workId}
          renderItem={({ item }) => <OrderRow order={item} onPress={() => setOpen(item)} />}
          ItemSeparatorComponent={() => <View style={s.gap} />}
          ListEmptyComponent={isLoading ? <View style={s.gap2}>{[0, 1, 2].map((i) => <OrderRowSkeleton key={i} />)}</View> : <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} actionLabel={actionLabel} onAction={onAction} />}
          contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 120 }]}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          showsVerticalScrollIndicator={false}
        />
      )}
      <OrderSheet order={open} onClose={() => setOpen(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  head: { paddingHorizontal: 16, gap: 4, marginBottom: 12 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  gap: { height: 10 },
  gap2: { gap: 10 },
});
