import { StyleSheet, View } from "react-native";
import type { FlowPhase } from "@/entities/market-flow";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ICON: Record<FlowPhase, IconName> = { assigned: "user-check", advance: "credit-card", pending: "clock", paid: "check-circle", in_progress: "activity", review: "pause-circle", completed: "flag", rated: "star", cancelled: "x-circle" };

// One line on top of an order saying where it stands and what comes next, for the client or the seller (the web's order lead). `lead`
// picks another text of the same role (a finished order whose rating window is already over).
export function FlowLead({ phase, role, lead }: { phase: FlowPhase; role: "client" | "seller"; lead?: string }) {
  const c = useColors();
  const { t } = useT();
  const tone = phase === "cancelled" ? c.err : phase === "assigned" || phase === "advance" || phase === "pending" || phase === "review" ? c.warn : phase === "completed" || phase === "rated" ? c.ok : c.accent;
  const bg = phase === "cancelled" ? c.errBg : tone === c.warn ? c.warnBg : tone === c.ok ? c.okBg : c.tint2;
  return (
    <View style={[s.box, { backgroundColor: bg }]} accessibilityRole="text">
      <Icon name={ICON[phase]} size={18} color={tone} />
      <View style={s.col}>
        <Text variant="small" weight="bold" style={{ color: tone }}>{t(`mf.phase.${phase}`)}</Text>
        <Text variant="small" tone="ink">{t(`mf.lead.${role}.${lead ?? phase}`)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 18, alignItems: "flex-start" },
  col: { flex: 1, gap: 2 },
});
