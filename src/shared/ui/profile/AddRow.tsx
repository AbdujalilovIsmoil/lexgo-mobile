import { View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "..";
import { ACCENTS, type Accent } from "./accents";

// A dashed full-width row at the end of a list: a tinted "+" circle and the full label ("Karta qo'shish").
export function AddRow({ accent, label, onPress }: { accent: Accent; label: string; onPress: () => void }) {
  const { dark } = useTheme();
  const [from, to] = ACCENTS[accent];
  const tone = dark ? to : from;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52, borderRadius: 18, borderWidth: 1.5, borderStyle: "dashed", borderColor: `${from}88`, backgroundColor: `${from}12` }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${from}2E`, alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={16} color={tone} /></View>
      <Text variant="small" weight="bold" style={{ color: tone }}>{label}</Text>
    </PressableScale>
  );
}
