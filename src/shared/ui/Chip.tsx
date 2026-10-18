import { StyleSheet, View } from "react-native";
import { brand, radius, useColors } from "@/shared/theme";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";
import { selectHaptic } from "@/shared/lib/haptics";

type Props = { label: string; active?: boolean; onPress?: () => void; icon?: IconName; color?: string };

// Filter chip: soft tint when idle, solid brand blue when active; `color` adds a small dot (a category colour).
export function Chip({ label, active, onPress, icon, color }: Props) {
  const c = useColors();
  return (
    <PressableScale
      haptic={false}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      hitSlop={{ top: 4, bottom: 4 }}
      onPress={() => {
        selectHaptic();
        onPress?.();
      }}
      style={[s.chip, { backgroundColor: active ? brand.b600 : c.surface2, borderColor: active ? brand.b600 : c.line }]}
    >
      {color ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color, borderWidth: active ? 1.5 : 0, borderColor: "#fff" }} /> : null}
      {icon ? <Icon name={icon} size={14} color={active ? "#fff" : c.gray} /> : null}
      <Text variant="small" weight="semibold" style={{ color: active ? "#fff" : c.ink }}>
        {label}
      </Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
});
