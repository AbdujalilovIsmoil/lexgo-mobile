import { StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "@/shared/ui";
import { stageColor, stageLabel, STAGES, type B2bClient } from "@/entities/admin-b2b";
import { fmtCompact } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// The desk's headline: number of clients, total deal value, and the whole funnel as one stacked bar with its legend.
export function B2bHero({ clients }: { clients: B2bClient[] }) {
  const { t } = useT();
  const total = clients.reduce((n, c) => n + c.value, 0);
  const active = clients.filter((c) => c.stage === "active" || c.stage === "renewal").length;
  const used = STAGES.filter((s) => clients.some((c) => c.stage === s));
  const count = (s: string) => clients.filter((c) => c.stage === s).length;
  return (
    <Card style={s.card}>
      <View style={s.top}>
        <View style={s.cell}><Text variant="h2">{clients.length}</Text><Text variant="caption" tone="gray">{t("admB2b.clients")}</Text></View>
        <View style={s.cell}><Text variant="h2" numberOfLines={1} adjustsFontSizeToFit>{fmtCompact(total)}</Text><Text variant="caption" tone="gray">{t("admB2b.dealValue")}</Text></View>
        <View style={s.cell}><View style={s.row}><Icon name="check-circle" size={16} color="#22C55E" /><Text variant="h2">{active}</Text></View><Text variant="caption" tone="gray">{stageLabel(t, "active")}</Text></View>
      </View>
      <View style={s.bar}>{used.map((st) => <View key={st} style={{ flex: count(st), backgroundColor: stageColor(st) }} />)}</View>
      <View style={s.legend}>
        {used.map((st) => <View key={st} style={s.item}><View style={[s.dot, { backgroundColor: stageColor(st) }]} /><Text variant="caption" tone="gray">{stageLabel(t, st)} {count(st)}</Text></View>)}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 12 },
  top: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  bar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
