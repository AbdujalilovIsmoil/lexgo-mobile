import { isOpenOrder, OrderInfo, type Order } from "@/entities/order";
import { SellerActions } from "@/features/order-actions";
import { PayBlock } from "@/features/order-service";
import { BottomSheet, SheetScroll, Text } from "@/shared/ui";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";

// One order in a drawer. A client with an unpaid order gets the payment block;
// a yurist/advokat looking at an open order gets accept / decline.
export function OrderSheet({ order: current, onClose }: { order: Order | null; onClose: () => void }) {
  const { t } = useT();
  const order = useKept(current);
  const seller = useTabRole() === "seller";
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={order ? order.title || order.serviceName || order.workId : ""} subtitle={order ? order.workId : undefined} snaps={[0.62, 0.93]}>
      <SheetScroll>
        {order ? (
          <>
            <OrderInfo order={order} />
            {seller ? (isOpenOrder(order) ? <SellerActions orderId={order.id} onDone={onClose} deadlineAt={order.acceptanceDeadlineAt} /> : null) : order.paymentStatus !== "paid" ? <PayBlock orderId={order.id} /> : <Text variant="small" tone="ok">{t("ord.paid")}</Text>}
          </>
        ) : null}
      </SheetScroll>
    </BottomSheet>
  );
}
