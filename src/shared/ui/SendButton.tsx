import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { shadows } from "@/shared/theme";
import { tapHaptic } from "@/shared/lib/haptics";
import { Icon } from "./Icon";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { enabled: boolean; onPress: () => void; size?: number; label?: string };

// Round send button. Dimmed and inert while there is nothing to send; turns
// brand blue (with a light shadow) as soon as `enabled` becomes true.
export function SendButton({ enabled, onPress, size = 44, label = "Send" }: Props) {
  const p = useSharedValue(enabled ? 1 : 0);
  useEffect(() => {
    p.value = withTiming(enabled ? 1 : 0, { duration: 180 });
  }, [enabled, p]);
  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ["rgba(255,255,255,0.14)", "#1668F0"]),
    transform: [{ scale: 0.94 + 0.06 * p.value }],
  }));
  const icon = useAnimatedStyle(() => ({ opacity: 0.4 + 0.6 * p.value }));
  return (
    <AnimatedPressable
      disabled={!enabled}
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      hitSlop={6}
      style={[s.btn, { width: size, height: size, borderRadius: size / 2 }, enabled && shadows.blue, box]}
    >
      <Animated.View style={icon}>
        <Icon name="arrow-up" size={Math.round(size * 0.48)} color="#FFFFFF" />
      </Animated.View>
    </AnimatedPressable>
  );
}

const s = StyleSheet.create({
  btn: { alignItems: "center", justifyContent: "center" },
});
