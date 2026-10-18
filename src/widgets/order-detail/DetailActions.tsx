import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { canCancelOrder, canCompleteOrder, marketStageOf, type MarketOrder } from "@/entities/order";
import { CallButtons, CancelOrderSheet, CompleteOrderSheet } from "@/features/order-actions";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Footer of the detail screen. Every button is there because the server allowed it:
// chat needs can_start_chat, cancel only while the payment waits, complete only if listed.
// Returns null when there is nothing to do.
export function DetailActions({ order }: { order: MarketOrder }) {
  const { t } = useT();
  const router = useRouter();
  const [cancel, setCancel] = useState<MarketOrder | null>(null);
  const [complete, setComplete] = useState<MarketOrder | null>(null);
  const rate = !!order.rating?.available && !order.ratingSubmitted;
  const calls = order.canCreateCall && !!order.roomId && ["pending", "active"].includes(marketStageOf(order));
  const extra = calls || canCancelOrder(order) || canCompleteOrder(order) || rate;
  if (!order.canStartChat && !extra) return null;
  return (
    <View style={s.col}>
      {order.canStartChat ? <Button title={t("mk3.openChat")} onPress={() => router.push({ pathname: "/chat/[roomId]", params: { roomId: order.roomId } })} variant="gradient" icon="message-circle" full /> : null}
      {calls ? <CallButtons order={order} /> : null}
      <View style={s.row}>
        {canCompleteOrder(order) ? <Button title={t("mk5.completeBtn")} onPress={() => setComplete(order)} variant="soft" icon="check" style={s.half} /> : null}
        {rate ? <Button title={t("mk4.rate")} onPress={() => router.push(`/rate/${order.workId}` as never)} variant="soft" icon="star" style={s.half} /> : null}
        {canCancelOrder(order) ? <Button title={t("mk5.cancelBtn")} onPress={() => setCancel(order)} variant="line" icon="x" style={s.half} /> : null}
      </View>
      <CancelOrderSheet order={cancel} onClose={() => setCancel(null)} />
      <CompleteOrderSheet order={complete} onClose={() => setComplete(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
});
