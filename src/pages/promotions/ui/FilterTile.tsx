import { StyleSheet } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { label: string; icon?: IconName; on: boolean; onPress: () => void; wide?: boolean; full?: boolean };

// A big selectable tile of the filter sheet (period or promotion type): a whole-tile radio button, 56pt tall.
export function FilterTile({ label, icon, on, onPress, wide, full }: Props) {
  const c = useColors();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      style={[s.tile, full ? s.full : wide ? s.wide : s.third, { backgroundColor: on ? c.tint : c.surface, borderColor: on ? c.accent : c.line }]}
    >
      {icon ? <Icon name={icon} size={20} color={on ? c.accent : c.gray} /> : null}
      <Text variant="small" weight="semibold" center numberOfLines={2} style={{ color: on ? c.accentStrong : c.ink }}>{label}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  tile: { minHeight: 56, borderRadius: radius.r, borderWidth: 1.5, paddingVertical: 8, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", gap: 4 },
  third: { width: "31%", flexGrow: 1 },
  full: { width: "100%" },
  wide: { width: "48%", flexGrow: 1 },
});
