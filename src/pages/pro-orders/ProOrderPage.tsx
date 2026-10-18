import { useLocalSearchParams, useRouter } from "expo-router";
import { actionsOf, useOrderLive, useProOrders } from "@/entities/pro-order";
import { useCabinet } from "@/entities/pro-onboarding";
import { OrderActionsBar, useSellerCall } from "@/features/pro-order-actions";
import { AdditionalCard, BuyerCard, OrderFactsCard, OrderQuoteCard, OrderResultCard, OrderSummaryCard, OrderTimeline } from "@/widgets/pro-order";
import { EmptyState } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// One marketplace order: summary, buyer (no phone), details, history, and the actions its status allows.
export default function ProOrderPage() {
  const { t } = useT();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useProOrders();
  const cabinet = useCabinet();
  useOrderLive();
  const order = q.data?.find((o) => o.id === id);
  const sc = useSellerCall(order);
  const allowed = cabinet.data?.actions.acceptOrders ?? true;
  const a = order ? actionsOf(order, allowed) : null;
  const hasActions = !!a && (a.accept || a.decline || a.complete || a.extra || a.moves.length > 0);
  return (
    <AdminPage title={order?.workId || t("nav1.menu.proOrders")} footer={order && hasActions ? <OrderActionsBar order={order} acceptAllowed={allowed} /> : undefined}>
      <QueryBoundary query={q}>
        {order ? (
          <PageScroll onRefresh={() => void q.refetch()} refreshing={q.isRefetching}>
            <OrderSummaryCard order={order} />
            <AdditionalCard order={order} />
            <BuyerCard order={order} onChat={() => router.push(`/chat/${order.roomId}` as never)} onCall={(k) => void sc.call(k)} calling={sc.calling} />
            <OrderQuoteCard order={order} />
            <OrderResultCard order={order} />
            <OrderFactsCard order={order} />
            <OrderTimeline orderId={order.id} />
          </PageScroll>
        ) : (
          <EmptyState icon="shopping-bag" title={t("sl9.notFound")} text={t("sl9.notFoundText")} />
        )}
      </QueryBoundary>
    </AdminPage>
  );
}
