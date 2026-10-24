import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { clock, complaintState, msUntil, type FlowOrder } from "@/entities/market-flow";
import { OrderComplaintSheet } from "@/features/market-flow";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useNow } from "@/shared/lib/pay/useNow";
import { useT } from "@/shared/i18n";

// TZ §10: the complaint — a separate action from the rating, offered only in the backend's window (with its own countdown) and never
// twice: a 1–2 star rating opens one by itself, after which this card only says it is with the call center. After the window: gone.
export function ComplaintCard({ orderId, flow }: { orderId: string; flow: FlowOrder }) {
  const c = useColors();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const live = flow.complaint.available && !flow.complaint.submitted;
  const now = useNow(live, 1000);
  const state = complaintState(flow.complaint, now);
  if (state === "none" || state === "closed") return null;
  if (state === "submitted") {
    return (
      <View style={[s.note, { backgroundColor: c.surface2 }]}>
        <Icon name="message-square" size={16} tone="gray" />
        <Text variant="small" tone="gray" style={s.flex}>{t("mf.cp.pending")}</Text>
      </View>
    );
  }
  const left = flow.complaint.deadlineAt ? msUntil(flow.complaint.deadlineAt, now) : 0;
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Icon name="alert-triangle" size={18} color={c.warn} />
        <Text variant="body" weight="bold" style={s.flex}>{t("mf.cp.lead")}</Text>
        {left > 0 ? <Text variant="small" weight="bold" style={{ color: c.warn }}>{clock(left)}</Text> : null}
      </View>
      {left > 0 ? <Text variant="caption" tone="gray">{t("mf.cp.left", { time: clock(left) })}</Text> : null}
      <Button title={t("mf.cp.open")} icon="flag" variant="line" onPress={() => setOpen(true)} full />
      <OrderComplaintSheet visible={open} onClose={() => setOpen(false)} orderId={orderId} url={flow.complaint.url} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 14 },
});
