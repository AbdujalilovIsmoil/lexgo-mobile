import { StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "..";
import type { Accent } from "./accents";

// The "add" button at the end of a list (Adliya: "A'zo qo'shish"): a full-width soft blue button, the "+" and the label in ink, bold.
export function AddRow({ label, onPress, icon = "plus" }: { accent: Accent; label: string; onPress: () => void; icon?: IconName }) {
  const { colors: c } = useTheme();
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={label} style={[s.row, { backgroundColor: c.tint2 }]}>
      <Icon name={icon} size={18} color={c.ink} />
      <Text variant="body" weight="bold" style={[s.tx, { color: c.ink }]}>{label}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 54, borderRadius: 14 },
  tx: { fontSize: 16 },
});
