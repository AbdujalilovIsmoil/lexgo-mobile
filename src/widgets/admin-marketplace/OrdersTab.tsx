import { OrderRow, useOrders, type MktOrder } from "@/entities/admin-marketplace";
import type { MktFilters } from "@/features/admin-marketplace";
import { PagedList } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { View } from "react-native";
import { useT } from "@/shared/i18n";
import { MktFilterBar } from "./MktFilterBar";

// Orders tab: filters on top, then the paged list; a tap opens the order sheet.
export function OrdersTab({ f, onOpen }: { f: MktFilters; onOpen: (o: MktOrder) => void }) {
  const { t } = useT();
  const { items, total, query } = useOrders(f.scope);
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(o) => o.id}
      renderItem={(o) => <OrderRow item={o} onPress={() => onOpen(o)} />}
      empty={{ icon: "shopping-bag", title: f.active ? t("admMkt.orders.emptyFiltered") : t("admMkt.orders.empty"), text: f.active ? t("admMkt.orders.emptyFilteredText") : t("admMkt.orders.emptyText") }}
      header={<View><MktFilterBar f={f} withParties />{total != null ? <Text variant="caption" tone="gray" style={{ marginBottom: 8, marginLeft: 4 }}>{t("admMkt.orders.count", { n: total })}</Text> : null}</View>}
    />
  );
}
