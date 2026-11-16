import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; label: string; index: number; pos: SharedValue<number>; active: boolean; onPress: () => void; seg?: boolean; fill?: boolean };
const SEG_H = 42; // ProfileTabs SEG_H

// One tab: the grey look and the white look are stacked and cross-faded by how far the gliding background is from
// this tab, so the colours change exactly as the background arrives (no jump).
export function TabCell({ icon, label, index, pos, active, onPress, seg, fill }: Props) {
  const c = useColors();
  const near = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - Math.abs(pos.value - index)) }));
  const far = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.abs(pos.value - index)) }));
  return (
    <PressableScale haptic={false} scale={0.95} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }} style={[s.tab, seg && s.segTab]}>
      <Animated.View style={[s.layer, seg && s.segLayer, far]}>
        <Icon name={icon} size={18} color={c.gray} />
        <Text variant="caption" weight={seg ? "bold" : "semibold"} numberOfLines={1} adjustsFontSizeToFit style={[{ color: c.gray }, seg && s.segTx]}>{label}</Text>
      </Animated.View>
      <Animated.View style={[s.layer, seg && s.segLayer, near]}>
        <Icon name={icon} size={18} color={seg && !fill ? c.ink : "#FFFFFF"} />
        <Text variant="caption" weight={seg ? "bold" : "semibold"} numberOfLines={1} adjustsFontSizeToFit style={[seg && !fill ? { color: c.ink } : s.white, seg && s.segTx]}>{label}</Text>
      </Animated.View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  tab: { flex: 1, height: 56, borderRadius: 18 },
  layer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 2 },
  white: { color: "#FFFFFF" },
  segTab: { height: SEG_H, borderRadius: 10 },
  segLayer: { flexDirection: "row", gap: 6 },
  segTx: { fontSize: 14, lineHeight: 18 },
});
