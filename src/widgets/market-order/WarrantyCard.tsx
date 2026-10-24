import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { FlowOrder, FlowPhase } from "@/entities/market-flow";
import { OrderWarrantySheet } from "@/features/market-flow";
import { Button, Icon, Pill, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const OPEN: FlowPhase[] = ["paid", "in_progress", "review", "completed", "rated"];

// TZ §11: the LexGo warranty of this order. The request goes to the call center; until it decides, the card only says "under review".
export function WarrantyCard({ orderId, flow, phase }: { orderId: string; flow: FlowOrder; phase: FlowPhase }) {
  const c = useColors();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  if (!flow.warrantyUrl || (!OPEN.includes(phase) && !flow.warranty)) return null;
  const w = flow.warranty;
  const decided = !!w && (w.status === "resolved" || w.status === "rejected" || !!w.decision);
  const pending = !decided && (sent || !!w);
  return (
    <SectionCard title={t("mf.wr.title")}>
      <View style={s.lead}>
        <Icon name="shield" size={18} color={c.accent} />
        <Text variant="small" tone="gray" style={s.flex}>{t("mf.wr.lead")}</Text>
      </View>
      {decided && w ? (
        <View style={s.col}>
          <View style={s.head}>
            <Text variant="small" weight="bold" style={s.flex}>{t("mf.wr.decided")}</Text>
            <Pill label={t(`mf.wr.status.${w.status}`) === `mf.wr.status.${w.status}` ? w.status : t(`mf.wr.status.${w.status}`)} tone={w.status === "rejected" ? "err" : "ok"} small />
          </View>
          {w.resolution ? <Text variant="small">{t(`mf.wr.resolution.${w.resolution}`) === `mf.wr.resolution.${w.resolution}` ? w.resolution : t(`mf.wr.resolution.${w.resolution}`)}</Text> : null}
          {w.decision ? <Text variant="caption" tone="gray">{`${t("mf.wr.decision")}: ${w.decision}`}</Text> : null}
        </View>
      ) : pending ? (
        <View style={[s.note, { backgroundColor: c.warnBg }]}>
          <Icon name="clock" size={16} color={c.warn} />
          <Text variant="small" style={s.flex}>{t("mf.wr.pending")}</Text>
        </View>
      ) : (
        <Button title={t("mf.wr.open")} icon="shield" variant="soft" onPress={() => setOpen(true)} style={s.center} />
      )}
      <OrderWarrantySheet visible={open} onClose={() => setOpen(false)} orderId={orderId} url={flow.warrantyUrl} onSent={() => setSent(true)} />
    </SectionCard>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  lead: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  col: { gap: 4 },
  flex: { flex: 1 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 14 },
  center: { alignSelf: "center" },
});
