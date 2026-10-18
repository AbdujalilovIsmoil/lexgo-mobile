import { StyleSheet, View } from "react-native";
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from "react-native-reanimated";
import { PressableScale } from "../PressableScale";
import { Icon, type IconName } from "../Icon";
import { useSegmentPos } from "./SegmentTrack";

type Props = { selected?: boolean; index: number; label: string; icon?: IconName; on: string; off: string; iconOn?: string; onPress: () => void; small?: boolean };

// One segment. Its colours blend as the thumb glides across it (not at the tap).
export function SegmentItem({ selected, index, label, icon, on, off, iconOn, onPress, small }: Props) {
  const pos = useSegmentPos();
  const text = useAnimatedStyle(() => ({ color: interpolateColor(pos ? pos.value : index, [index - 1, index, index + 1], [off, on, off]) }));
  const lit = useAnimatedStyle(() => ({ opacity: interpolate(pos ? pos.value : index, [index - 1, index, index + 1], [0, 1, 0], "clamp") }));
  return (
    <PressableScale haptic={false} onPress={onPress} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!selected }} style={s.seg}>
      {icon ? (
        <View style={s.icon}>
          <Icon name={icon} size={15} color={off} />
          <Animated.View style={[StyleSheet.absoluteFill, lit]}><Icon name={icon} size={15} color={iconOn ?? on} /></Animated.View>
        </View>
      ) : null}
      <Animated.Text numberOfLines={1} style={[small ? s.small : s.base, text]}>{label}</Animated.Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  seg: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  icon: { width: 15, height: 15 },
  base: { fontFamily: "Inter_700Bold", fontSize: 13 },
  small: { fontFamily: "Inter_700Bold", fontSize: 12 },
});
