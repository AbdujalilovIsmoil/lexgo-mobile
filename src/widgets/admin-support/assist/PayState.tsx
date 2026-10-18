import { StyleSheet, View } from "react-native";
import type { PayPhase } from "@/entities/admin-support";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useSum } from "./useSum";

const ICON: Record<"pending" | "paid" | "rejected", IconName> = { pending: "clock", paid: "check-circle", rejected: "x-circle" };

// Payment progress of an operator's request: waiting for Telegram approval, paid or rejected.
export function PayState({ phase, amount = 0, currency = "UZS" }: { phase: PayPhase; amount?: number; currency?: string }) {
  const { t } = useT();
  const c = useColors();
  const sum = useSum();
  if (!phase) return null;
  const color = phase === "paid" ? c.ok : phase === "rejected" ? c.err : c.warn;
  const bg = phase === "paid" ? c.okBg : phase === "rejected" ? c.errBg : c.warnBg;
  return (
    <View style={[s.box, { backgroundColor: bg }]}>
      <Icon name={ICON[phase]} size={20} color={color} />
      <View style={s.col}>
        <Text variant="small" weight="bold" style={{ color }}>{t(`admSupB.pay.${phase}`)}</Text>
        <Text variant="caption" tone="gray">{t(`admSupB.pay.${phase}Hint`)}</Text>
      </View>
      {amount > 0 ? <Text variant="small" weight="bold" style={{ color }}>{sum(amount, currency)}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14 },
  col: { flex: 1, gap: 1 },
});
