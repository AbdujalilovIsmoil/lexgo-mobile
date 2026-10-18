import { ScrollView, StyleSheet } from "react-native";
import { isOpenOrder, OrderInfo, serviceStageOf, type Order } from "@/entities/order";
import { PayBlock } from "@/features/order-service";
import { SellerActions } from "@/features/order-actions";
import { Text } from "@/shared/ui";
import { useAccess } from "@/entities/access";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Body of /orders/[id] for a catalogue service order (GET /orders): facts and,
// while unpaid, the payment block. A yurist/advokat looking at an open order gets accept / decline.
export function ServiceOrderDetail({ order, onDone }: { order: Order; onDone: () => void }) {
  const { t } = useT();
  const insets = useInsets();
  const seller = useAccess().seller;
  return (
    <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
      <OrderInfo order={order} />
      {seller ? (isOpenOrder(order) ? <SellerActions orderId={order.id} onDone={onDone} /> : null) : order.paymentStatus === "paid" ? <Text variant="small" tone="ok">{t("ord.paid")}</Text> : serviceStageOf(order) === "cancelled" ? null : <PayBlock orderId={order.id} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14, paddingTop: 4 },
});
