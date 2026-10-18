import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtUzs, paymentTitle } from "../lib/format";
import { phaseOf, type PayPhase } from "../model/status";
import type { PaymentRow } from "../model/types";
import { PaymentStatusPill } from "./PaymentStatusPill";

const ICON: Record<PayPhase, IconName> = { pending_confirmation: "clock", awaiting: "clock", paid: "check-circle", failed: "x-circle", cancelled: "x-circle", refunded: "rotate-ccw" };
export const PAY_TILE = 44;

// One payment in the history list, flat (hairlines divide the rows): a status-tinted tile, what it was for, when · work
// number, the amount and the state pill on the right.
export function PaymentRowCard({ item, onPress }: { item: PaymentRow; onPress: () => void }) {
  const c = useColors();
  const { t, locale } = useT();
  const phase = phaseOf(item);
  const tone = phase === "paid" ? c.ok : phase === "refunded" ? c.gray : phase === "failed" || phase === "cancelled" ? c.err : c.warn;
  return (
    <PressableScale onPress={onPress} style={s.row}>
      <View style={[s.tile, { backgroundColor: `${tone}24` }]}><Icon name={ICON[phase]} size={20} color={tone} /></View>
      <View style={s.body}>
        <Text variant="body" weight="bold" numberOfLines={1}>{paymentTitle(item, t)}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{[fmtDateTime(item.createdAt, locale), item.workId].filter(Boolean).join(" · ")}</Text>
      </View>
      <View style={s.right}>
        <Text variant="body" weight="bold" style={phase === "failed" || phase === "cancelled" ? { color: c.gray } : undefined}>{fmtUzs(item.amount, t)}</Text>
        <PaymentStatusPill status={item.status} method={item.method} />
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  tile: { width: PAY_TILE, height: PAY_TILE, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 3 },
  right: { alignItems: "flex-end", gap: 5 },
});
