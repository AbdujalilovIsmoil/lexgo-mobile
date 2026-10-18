import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";

type Item = { value: string | number; label: string };

// A row of big-number tiles.
export function Tiles({ items }: { items: Item[] }) {
  const c = useColors();
  return (
    <View style={s.row}>
      {items.map((i) => (
        <View key={i.label} style={[s.tile, { backgroundColor: c.tint, borderColor: c.line }]}>
          <Text style={[s.n, { color: c.accent }]}>{i.value}</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{i.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 14, gap: 2 },
  n: { fontFamily: "Onest_800ExtraBold", fontSize: 28, lineHeight: 32 },
});
