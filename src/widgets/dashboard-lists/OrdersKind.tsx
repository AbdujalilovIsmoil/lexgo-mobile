import { useState } from "react";
import { OrderRow, useOrders } from "@/entities/order";
import { useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PagedList } from "@/shared/ui/admin";
import { KindChips } from "./KindChips";

const DONE = new Set(["completed", "rated", "cancelled", "canceled", "declined", "rejected", "lost", "closed"]);
type Filter = "active" | "all";

// Counter "Buyurtmalar": marketplace orders, the unfinished ones first.
export function OrdersKind() {
  const { t } = useT();
  const nav = useKindNav();
  const query = useOrders();
  const [filter, setFilter] = useState<Filter>("active");
  const all = query.data ?? [];
  const items = filter === "all" ? all : all.filter((o) => !DONE.has(o.status));
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(o) => o.id || o.workId}
      header={<KindChips<Filter> value={filter} onChange={setFilter} options={[{ value: "active", label: t("cl7.filters.active"), count: all.filter((o) => !DONE.has(o.status)).length }, { value: "all", label: t("cl7.filters.all"), count: all.length }]} />}
      empty={{ icon: "shopping-bag", title: t("cl7.empty.orders"), text: t("cl7.empty.ordersText") }}
      renderItem={(o) => <OrderRow order={o} onPress={() => nav.order(o.id)} />}
    />
  );
}
