import { OrderRow, useOrders } from "@/entities/order";
import { useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PreviewList } from "./PreviewList";

const DONE = new Set(["completed", "rated", "cancelled", "canceled", "declined", "rejected", "lost", "closed"]);
type Props = { go: (fn: () => void) => void };

// Drawer rows of "Buyurtmalar": the five newest unfinished orders.
export function OrdersPreview({ go }: Props) {
  const { t } = useT();
  const nav = useKindNav();
  const q = useOrders();
  const items = (q.data ?? []).filter((o) => !DONE.has(o.status)).slice(0, 5);
  return <PreviewList query={q} items={items} keyOf={(o) => o.id || o.workId} empty={{ icon: "shopping-bag", title: t("cl7.empty.orders"), text: t("cl7.empty.ordersText") }} render={(o) => <OrderRow order={o} onPress={() => go(() => nav.order(o.id))} />} />;
}
