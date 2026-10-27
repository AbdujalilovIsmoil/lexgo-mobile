import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { clock, complaintState, msUntil, type FlowOrder } from "@/entities/market-flow";
import { OrderComplaintSheet } from "@/features/market-flow";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useNow } from "@/shared/lib/pay/useNow";
import { useT } from "@/shared/i18n";

const OUTCOMES = ["rework_required", "refund_required", "rejected", "resolved"];

// TZ §10: the complaint — a separate action from the rating, offered only in the backend's window (with its own countdown) and never
// twice: a 1–2 star rating opens one by itself, after which this card says it is with the call center, then the call center's ruling.
// After a rework a fresh window opens and a new complaint may be filed. After the window: gone.
export function ComplaintCard({ orderId, flow }: { orderId: string; flow: FlowOrder }) {
  const c = useColors();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const live = flow.complaint.available && !flow.complaint.submitted;
  const now = useNow(live, 1000);
  const state = complaintState(flow.complaint, now);
  if (state === "none" || state === "closed") return null;
  if (state === "submitted") {
    // The call center's ruling once it came (rework, refund, rejection, resolved) with its note; until then "under review".
    const outcome = OUTCOMES.includes(flow.complaint.status) ? flow.complaint.status : "";
    return (
      <View style={[s.note, { backgroundColor: outcome === "rejected" ? c.surface2 : outcome ? c.tint2 : c.surface2 }]}>
        <Icon name={outcome ? "check-square" : "message-square"} size={16} tone="gray" />
        <View style={s.flex}>
          <Text variant="small" tone={outcome ? "ink" : "gray"}>{t(outcome ? `mf.cp.out.${outcome}` : "mf.cp.pending")}</Text>
          {outcome && outcome !== "rework_required" && flow.complaint.resolutionNote ? <Text variant="caption" tone="gray">{flow.complaint.resolutionNote}</Text> : null}
        </View>
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
