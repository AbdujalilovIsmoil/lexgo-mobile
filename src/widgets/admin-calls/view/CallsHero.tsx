import { StyleSheet, View } from "react-native";
import { Card, Gauge, Icon, PressableScale, Text } from "@/shared/ui";
import type { Drill } from "@/entities/admin-dash";
import { callsDrill } from "../callsDrill";
import type { CallsCtx } from "../useCallsCtx";

// The headline: answer-rate gauge and the three counts beside it — each opens the call breakdown.
export function CallsHero({ x, onOpen }: { x: CallsCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, a, rate } = x;
  const open = (title: string, value: string, sub?: string) => () => onOpen(callsDrill(x, title, value, sub));
  const rows = [
    { icon: "phone" as const, color: "#3B82F6", label: t("admCalls.total"), value: a.total, on: open(t("admCalls.total"), String(a.total)) },
    { icon: "phone-incoming" as const, color: "#22C55E", label: t("admCalls.answered"), value: a.answered, on: open(t("admCalls.answered"), String(a.answered), `${t("admCalls.answerRate")}: ${rate}%`) },
    { icon: "phone-missed" as const, color: "#EF4444", label: t("admCalls.missed"), value: a.missed, on: open(t("admCalls.missed"), String(a.missed), `${t("admDashB.drill.missRate")}: ${100 - rate}%`) },
  ];
  return (
    <Card style={s.card}>
      <View style={s.gauge}><Gauge value={rate / 100} text={`${rate}%`} label={t("admCalls.answerRate")} color="#22C55E" size={150} /></View>
      <View style={s.col}>
        {rows.map((r) => (
          <PressableScale key={r.label} onPress={r.on} scale={0.96} style={s.row} accessibilityRole="button">
            <View style={[s.dot, { backgroundColor: `${r.color}22` }]}><Icon name={r.icon} size={16} color={r.color} /></View>
            <View style={s.fill}><Text variant="h4">{r.value}</Text><Text variant="caption" tone="gray" numberOfLines={1}>{r.label}</Text></View>
          </PressableScale>
        ))}
        <PressableScale onPress={open(t("admCalls.avg"), fmt.mmss(a.avgDurationSec))} scale={0.96} style={s.row} accessibilityRole="button">
          <View style={[s.dot, { backgroundColor: "#8B5CF622" }]}><Icon name="clock" size={16} color="#8B5CF6" /></View>
          <View style={s.fill}><Text variant="h4">{fmt.mmss(a.avgDurationSec)}</Text><Text variant="caption" tone="gray" numberOfLines={1}>{t("admCalls.avg")}</Text></View>
        </PressableScale>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
  gauge: { flex: 1.1 },
  col: { flex: 1, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
