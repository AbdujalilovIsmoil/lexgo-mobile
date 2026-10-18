import { StyleSheet, View } from "react-native";
import { Card } from "../Card";
import { Text } from "../Text";
import { useColors } from "@/shared/theme";

export type CcStat = { value: string; label: string; color?: string };
export type CcSegment = { key: string; value: number; color: string; label: string };

// Summary card on top of an admin list: 2-4 headline numbers, then one stacked bar with its legend.
export function CcHero({ stats, segments }: { stats: CcStat[]; segments?: CcSegment[] }) {
  const c = useColors();
  const used = (segments ?? []).filter((x) => x.value > 0);
  return (
    <Card style={s.card}>
      <View style={s.top}>
        {stats.map((x) => (
          <View key={x.label} style={s.cell}>
            <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit style={x.color ? { color: x.color } : undefined}>{x.value}</Text>
            <Text variant="caption" style={{ color: c.gray }} numberOfLines={1}>{x.label}</Text>
          </View>
        ))}
      </View>
      {used.length ? (
        <>
          <View style={s.bar}>{used.map((x) => <View key={x.key} style={{ flex: x.value, backgroundColor: x.color }} />)}</View>
          <View style={s.legend}>
            {used.map((x) => (
              <View key={x.key} style={s.item}>
                <View style={[s.dot, { backgroundColor: x.color }]} />
                <Text variant="caption" style={{ color: c.gray }}>{x.label}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 12 },
  top: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, gap: 2 },
  bar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
