import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { canCancelOrder, canCompleteOrder, orderPhase, useRatingWindow, type MarketOrder } from "@/entities/order";
import { callTypesOf, chatModeOf, phaseFinished } from "@/entities/market-flow";
import { CallButtons, CancelOrderSheet, CompleteOrderSheet } from "@/features/order-actions";
import { CancelRequestSheet } from "@/features/market-flow";
import { Button, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Footer of the detail screen. Every button is there because the server allowed it (TZ §6–§8): chat and calls only after the backend
// unlocked contact; a finished order's chat stays readable (read-only) and its calls stop; cancel only while the payment waits, complete only
// if listed. Returns null when there is nothing to do or say.
export function DetailActions({ order }: { order: MarketOrder }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const [cancel, setCancel] = useState<MarketOrder | null>(null);
  const [complete, setComplete] = useState<MarketOrder | null>(null);
  const [asking, setAsking] = useState(false);
  const phase = orderPhase(order);
  const chat = chatModeOf(order, phase);
  const calls = callTypesOf(order, phase);
  const rate = useRatingWindow(order).open;
  const askCancel = order.flow.canRequestCancellation && !canCancelOrder(order);
  const extra = calls.length > 0 || canCancelOrder(order) || canCompleteOrder(order) || rate || askCancel;
  if (chat === "none" && !extra) return null;
  const openChat = () => router.push({ pathname: "/chat/[roomId]", params: { roomId: order.roomId } });
  return (
    <View style={s.col}>
      {chat === "open" ? <Button title={t("mk3.openChat")} onPress={openChat} variant="gradient" icon="message-circle" full /> : null}
      {chat === "readOnly" ? <Button title={t("mf.ct.viewChat")} onPress={openChat} variant="line" icon="message-circle" full /> : null}
      {chat === "readOnly" || chat === "locked" ? (
        <View style={s.note}>
          <Icon name="lock" size={13} color={c.gray} />
          <Text variant="caption" tone="gray" style={s.half}>{t(chat === "readOnly" ? (phaseFinished(phase) ? "mf.ct.readOnly" : "mf.ct.readOnlyNow") : phase === "replacing" ? "mf.ct.lockedAccept" : "mf.ct.locked")}</Text>
        </View>
      ) : null}
      {calls.length ? <CallButtons order={order} types={calls} /> : null}
      <View style={s.row}>
        {canCompleteOrder(order) ? <Button title={t("mk5.completeBtn")} onPress={() => setComplete(order)} variant="soft" icon="check" style={s.half} /> : null}
        {rate ? <Button title={t("mk4.rate")} onPress={() => router.push(`/rate/${order.workId}` as never)} variant="soft" icon="star" style={s.half} /> : null}
        {canCancelOrder(order) ? <Button title={t("mk5.cancelBtn")} onPress={() => setCancel(order)} variant="line" icon="x" style={s.half} /> : null}
      </View>
      {askCancel ? <Button title={t("mf.cr.button")} onPress={() => setAsking(true)} variant="line" icon="slash" full /> : null}
      <CancelOrderSheet order={cancel} onClose={() => setCancel(null)} />
      <CancelRequestSheet orderId={order.id} visible={asking} onClose={() => setAsking(false)} />
      <CompleteOrderSheet order={complete} onClose={() => setComplete(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  note: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
});
