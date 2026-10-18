import { StyleSheet, View } from "react-native";
import { Card, Gauge, Text } from "@/shared/ui";
import { kpiTint, type Kpi } from "@/entities/admin-hrm";
import { useT } from "@/shared/i18n";

// Hero of the KPI list: gauge with the average score and the good / middling / low split of the metrics.
export function KpiSummary({ items }: { items: Kpi[] }) {
  const { t } = useT();
  const avg = items.length ? items.reduce((n, k) => n + k.score, 0) / items.length : 0;
  const n = (f: (s: number) => boolean) => items.filter((k) => f(k.score)).length;
  const stats = [{ v: n((x) => x >= 90), c: kpiTint(100) }, { v: n((x) => x >= 60 && x < 90), c: kpiTint(70) }, { v: n((x) => x < 60), c: kpiTint(0) }];
  return (
    <Card style={s.card}>
      <Gauge value={avg / 100} text={String(Math.round(avg))} label={t("admHrmC.avgScore")} color={kpiTint(avg)} />
      <View style={s.side}>
        <Text variant="h2">{items.length}</Text>
        <Text variant="caption" tone="gray">{t("admHrmC.metrics")}</Text>
        <View style={s.dots}>{stats.map((x) => <View key={x.c} style={s.dot}><View style={[s.pt, { backgroundColor: x.c }]} /><Text variant="small" weight="bold">{x.v}</Text></View>)}</View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  side: { flex: 1, gap: 2, alignItems: "flex-start" },
  dots: { flexDirection: "row", gap: 12, marginTop: 8 },
  dot: { flexDirection: "row", alignItems: "center", gap: 5 },
  pt: { width: 8, height: 8, borderRadius: 4 },
});
