import { View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "..";
import { IconTile } from "./IconTile";
import type { Accent } from "./accents";

type Props = { accent: Accent; icon: IconName; label: string; sub?: string; onPress: () => void };

// A full-width action row at the foot of a section (Adliya): a white bordered card — the soft icon tile, the label in bold (+ a one-line
// hint) and a chevron.
export function ManageRow({ accent, icon, label, sub, onPress }: Props) {
  const { colors: c, dark, glass } = useTheme();
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={label} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: dark || glass ? c.surface2 : "#FFFFFF", borderWidth: 1, borderColor: dark || glass ? c.line : "#E2E8F1" }}>
      <IconTile accent={accent} icon={icon} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="body" weight="bold">{label}</Text>
        {sub ? <Text variant="small" tone="gray" numberOfLines={2}>{sub}</Text> : null}
      </View>
      <Icon name="chevron-right" size={18} color={c.ink} />
    </PressableScale>
  );
}
