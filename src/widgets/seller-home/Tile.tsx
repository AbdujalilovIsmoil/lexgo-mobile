import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";

// A small metric inside a panel: icon, the value in large type and what it is.
export function Tile({ icon, value, label, tone, bar }: { icon: IconName; value: string; label: string; tone?: string; bar?: number }) {
  const c = useColors();
  return (
    <View style={[s.tile, { backgroundColor: c.surface2 }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={[s.ico, { backgroundColor: `${tone ?? c.accent}22` }]}><Icon name={icon} size={16} color={tone ?? c.accent} /></View>
      <Text variant="h4" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text variant="caption" tone="gray" numberOfLines={2} style={{ flex: 1 }}>{label}</Text>
      <View style={[s.track, { backgroundColor: bar != null ? c.line : "transparent" }]}>{bar != null ? <View style={[s.fill, { width: `${Math.max(0, Math.min(100, bar))}%`, backgroundColor: tone ?? c.accent }]} /> : null}</View>
    </View>
  );
}

export const tilesStyle = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, half: { width: "48.5%" } });
const s = StyleSheet.create({ tile: { height: 124, gap: 4, padding: 12, borderRadius: 14 }, ico: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 }, track: { height: 4, borderRadius: 2, overflow: "hidden" }, fill: { height: 4, borderRadius: 2 } });
