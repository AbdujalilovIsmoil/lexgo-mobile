import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "..";
import { ACCENTS, type Accent } from "./accents";

type Props = { accent: Accent; icon: IconName; label: string; sub?: string; onPress: () => void };

// A full-width action row at the foot of a section: a gradient tile, the label (+ a one-line hint) and an arrow.
export function ManageRow({ accent, icon, label, sub, onPress }: Props) {
  const { dark } = useTheme();
  const [from, to] = ACCENTS[accent];
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: `${from}1A`, borderWidth: 1, borderColor: `${from}55` }}>
      <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={19} tone="white" />
      </LinearGradient>
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="body" weight="bold" style={{ color: dark ? to : from }}>{label}</Text>
        {sub ? <Text variant="caption" tone="gray" numberOfLines={2}>{sub}</Text> : null}
      </View>
      <Icon name="arrow-right" size={18} color={dark ? to : from} />
    </PressableScale>
  );
}
