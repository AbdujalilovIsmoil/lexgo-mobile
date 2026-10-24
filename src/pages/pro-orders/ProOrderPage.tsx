import { useLocalSearchParams, useRouter } from "expo-router";
import { actionsOf, useOrderLive, useProOrder, useProOrders } from "@/entities/pro-order";
import { phaseFinished, phaseOf, useFlowLive } from "@/entities/market-flow";
import { useCabinet } from "@/entities/pro-onboarding";
import { OrderActionsBar, useSellerCall } from "@/features/pro-order-actions";
import { AdditionalCard, BuyerCard, OrderFactsCard, OrderQuoteCard, OrderResultCard, OrderSummaryCard, OrderTimeline } from "@/widgets/pro-order";
import { AssignmentCard, ChecklistCard, FlowLead, PaymentsCard } from "@/widgets/market-order";
import { EmptyState } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// One marketplace order (read fresh by id — a push opens it directly): the assignment answer with its countdown, where it stands, the
// buyer (no phone), the checklist to work through, the result, the payments with LexGo's commission and the settlement, details and
// history, and the actions its status allows.
export default function ProOrderPage() {
  const { t } = useT();
  const router = useRouter();
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const one = useProOrder(id);
  const list = useProOrders();
  const cabinet = useCabinet();
  useOrderLive();
  useFlowLive();
  const order = one.data ?? (one.isError ? list.data?.find((o) => o.id === id) : undefined) ?? undefined;
  const q = order || !one.isError ? one : list;
  const sc = useSellerCall(order);
  const allowed = cabinet.data?.actions.acceptOrders ?? true;
  const a = order ? actionsOf(order, allowed) : null;
  const hasActions = !!a && (a.accept || a.decline || a.start || a.complete || a.extra || a.moves.length > 0);
  const phase = order ? phaseOf({ status: order.status, paymentStatus: order.paymentStatus, flow: order.flow, rated: order.rating.stars > 0 }) : null;
  const refresh = () => {
    void one.refetch();
    void list.refetch();
  };
  return (
    <AdminPage title={order?.workId || t("nav1.menu.proOrders")} footer={order && hasActions ? <OrderActionsBar order={order} acceptAllowed={allowed} /> : undefined}>
      <QueryBoundary query={q}>
        {order && phase ? (
          <PageScroll onRefresh={refresh} refreshing={one.isRefetching}>
            <OrderSummaryCard order={order} />
            <AssignmentCard order={order} flow={order.flow} acceptAllowed={allowed} />
            {phase !== "assigned" ? <FlowLead phase={phase} role="seller" /> : null}
            <AdditionalCard order={order} />
            <BuyerCard order={order} phase={phase} onChat={() => router.push(`/chat/${order.roomId}` as never)} onCall={(k) => void sc.call(k)} calling={sc.calling} />
            <ChecklistCard orderId={order.id} url={order.flow.checklistUrl} role="seller" roomId={order.roomId} editable={phase === "in_progress"} locked={phaseFinished(phase)} enabled={phase !== "assigned" && phase !== "advance" && phase !== "cancelled"} />
            <OrderQuoteCard order={order} />
            <OrderResultCard order={order} />
            <PaymentsCard orderId={order.id} url={order.flow.financialsUrl} role="seller" enabled={phase !== "assigned"} />
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
