import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Stats = { total: number; active: number; inactive: number; custom: number };

// Headline of the catalogue: total, active, inactive and hand-made services, with the active share as one bar.
export function ServicesHero({ stats: n }: { stats: Stats }) {
  const { t } = useT();
  const c = useColors();
  const cells: [number, string, string][] = [[n.total, "admSvcC.total", c.ink], [n.active, "admSvcC.active", c.ok], [n.inactive, "admSvcC.inactive", c.gray], [n.custom, "admSvcC.custom", c.warn]];
  return (
    <Card style={s.card}>
      <View style={s.row}>
        {cells.map(([v, k, color]) => <View key={k} style={s.cell}><Text variant="h2" style={{ color }}>{v}</Text><Text variant="caption" tone="gray" numberOfLines={1}>{t(k)}</Text></View>)}
      </View>
      <View style={[s.bar, { backgroundColor: c.surface2 }]}><View style={{ flex: n.active, backgroundColor: c.ok }} /><View style={{ flex: n.inactive }} /></View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 12 },
  row: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, gap: 2 },
  bar: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden" },
});
