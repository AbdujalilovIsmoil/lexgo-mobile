import { StyleSheet, View } from "react-native";
import { sparkBars } from "@/entities/promotion";
import { useColors } from "@/shared/theme";

// Tiny bar trend of a daily series (the last bar in full colour). Decorative: the figures sit next to it.
export function Sparkline({ values, height = 44 }: { values: number[]; height?: number }) {
  const c = useColors();
  const bars = sparkBars(values, height);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.row, { height }]}>
      {bars.map((h, i) => <View key={i} style={[s.bar, { height: h, backgroundColor: c.accent, opacity: i === bars.length - 1 ? 1 : 0.4 }]} />)}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "flex-end", gap: 4 }, bar: { flex: 1, borderRadius: 3 } });
