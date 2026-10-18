import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "../Text";

export type Bar = { label: string; value: number; hint?: string; color?: string };

// Horizontal bars scaled to the largest value — funnels, "by status", top lists.
export function BarList({ items, format = (n) => String(Math.round(n)) }: { items: Bar[]; format?: (n: number) => string }) {
  const c = useColors();
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <View style={s.col}>
      {items.map((it) => (
        <View key={it.label} style={s.item}>
          <View style={s.head}>
            <Text variant="small" weight="semibold" numberOfLines={1} style={s.label}>{it.label}</Text>
            <Text variant="small" weight="bold">{format(it.value)}</Text>
          </View>
          <View style={[s.track, { backgroundColor: c.surface2 }]}>
            <View style={[s.fill, { width: `${Math.max((it.value / max) * 100, it.value > 0 ? 3 : 0)}%`, backgroundColor: it.color ?? c.accent }]} />
          </View>
          {it.hint ? <Text variant="caption" tone="gray2">{it.hint}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  item: { gap: 5 },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  label: { flex: 1 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});
