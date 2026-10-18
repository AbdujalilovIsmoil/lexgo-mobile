import { StyleSheet, View } from "react-native";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

type Props = { on: boolean; label: string; color?: string; count?: number; onPress: () => void };

// One radio row of a filter / sort sheet: an optional coloured dot, the label, an optional count and a check circle.
export function SheetOption({ on, label, color, count, onPress }: Props) {
  const c = useColors();
  return (
    <PressableScale haptic={false} onPress={() => { selectHaptic(); onPress(); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.row, { backgroundColor: on ? c.tint2 : "transparent", borderColor: on ? c.accent : "transparent" }]}>
      {color ? <View style={[s.dot, { backgroundColor: color }]} /> : null}
      <Text variant="body" weight={on ? "bold" : "regular"} numberOfLines={1} style={s.flex}>{label}</Text>
      {count !== undefined ? <Text variant="caption" tone="gray">{count}</Text> : null}
      <View style={[s.radio, { borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>{on ? <Icon name="check" size={13} color="#FFFFFF" /> : null}</View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
