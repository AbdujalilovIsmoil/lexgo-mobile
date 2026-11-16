import { StyleSheet, View } from "react-native";
import { radius, useTheme } from "@/shared/theme";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";
import { selectHaptic } from "@/shared/lib/haptics";

type Props = { label: string; active?: boolean; onPress?: () => void; icon?: IconName; color?: string; idleFill?: string };

// Filter chip (Adliya .chip): white with a hairline when idle (or `idleFill`), solid navy ink when active; `color` adds a small dot (a category colour).
export function Chip({ label, active, onPress, icon, color, idleFill }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const on = dark || glass ? c.accent : c.ink; // the active fill
  const onInk = dark || glass ? "#0A1F44" : "#FFFFFF";
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
      style={[s.chip, { backgroundColor: active ? on : idleFill ?? (dark || glass ? c.surface2 : "#FFFFFF"), borderColor: active ? on : c.line }]}
    >
      {color ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color, borderWidth: active ? 1.5 : 0, borderColor: "#fff" }} /> : null}
      {icon ? <Icon name={icon} size={14} color={active ? onInk : c.gray} /> : null}
      <Text variant="small" weight="semibold" style={{ color: active ? onInk : c.ink, fontSize: 13 }}>
        {label}
      </Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 34, paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1.5 },
});
