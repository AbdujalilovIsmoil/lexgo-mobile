import { StyleSheet, View } from "react-native";
import { Card, Gauge, PressableScale, Text } from "@/shared/ui";
import type { Drill } from "@/entities/admin-dash";
import { atRiskDrill, churnedDrill, retainedDrill } from "../retentionDrills";
import type { RetCtx } from "../useRetentionCtx";

// Headline: retained-share gauge with the three numbers beside it, and the cohort bar (who of last period's active clients stayed).
export function RetentionHero({ x, onOpen }: { x: RetCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, d } = x;
  const prev = Math.max(d.previousPeriodActive, d.retainedClients + d.churnedThisMonth, 1);
  const rows = [
    { label: t("admRet.atRisk"), value: d.atRisk, color: "#EF4444", on: () => onOpen(atRiskDrill(x)) },
    { label: t("admRet.churned"), value: d.churnedThisMonth, color: "#F59E0B", on: () => onOpen(churnedDrill(x)) },
    { label: t("admDashB.drill.retainedClients"), value: d.retainedClients, color: "#22C55E", on: () => onOpen(retainedDrill(x)) },
  ];
  return (
    <Card style={s.card}>
      <View style={s.top}>
        <View style={s.gauge}><Gauge value={d.retainedPct / 100} text={fmt.pct(d.retainedPct)} label={t("admRet.retained")} color="#22C55E" size={150} /></View>
        <View style={s.col}>
          {rows.map((r) => (
            <PressableScale key={r.label} onPress={r.on} scale={0.96} style={s.row} accessibilityRole="button">
              <View style={[s.bar, { backgroundColor: r.color }]} />
              <View style={s.fill}><Text variant="h4">{fmt.int(r.value)}</Text><Text variant="caption" tone="gray" numberOfLines={1}>{r.label}</Text></View>
            </PressableScale>
          ))}
        </View>
      </View>
      <View style={s.cohort}>
        <Text variant="caption" tone="gray">{t("admDashB.drill.prevActive")}: {fmt.int(d.previousPeriodActive)} → {t("admDashB.drill.curActive")}: {fmt.int(d.currentPeriodActive)}</Text>
        <View style={s.track}>
          <View style={{ flex: d.retainedClients, backgroundColor: "#22C55E" }} />
          <View style={{ flex: Math.max(prev - d.retainedClients, 0), backgroundColor: "#EF4444" }} />
        </View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 12 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  gauge: { flex: 1.1 },
  col: { flex: 1, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
  bar: { width: 4, height: 34, borderRadius: 2 },
  cohort: { gap: 6 },
  track: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: "rgba(128,140,160,0.25)", gap: 2 },
});
