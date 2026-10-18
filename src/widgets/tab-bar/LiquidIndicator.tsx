import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "@/shared/theme";

type Props = { index: number; slot: number; hidden: boolean; left: number };

// The liquid droplet under the active tab. It glides with a spring and, while
// travelling, stretches wide and flattens like a drop of water, then settles.
export function LiquidIndicator({ index, slot, hidden, left }: Props) {
  const { dark } = useTheme();
  const x = useSharedValue(index * slot);
  const target = useSharedValue(index * slot);
  const show = useSharedValue(hidden ? 0 : 1);
  useEffect(() => {
    target.value = index * slot;
    x.value = withSpring(index * slot, { damping: 13, stiffness: 150, mass: 0.9 });
    show.value = withSpring(hidden ? 0 : 1, { damping: 14 });
  }, [index, slot, hidden, x, target, show]);
  const style = useAnimatedStyle(() => {
    const stretch = Math.min(Math.abs(target.value - x.value) / Math.max(slot, 1), 1.2);
    return { opacity: show.value, transform: [{ translateX: x.value }, { scaleX: (1 + stretch * 0.42) * show.value }, { scaleY: 1 - stretch * 0.14 }] };
  });
  const colors = dark ? (["rgba(255,255,255,0.24)", "rgba(255,255,255,0.08)"] as const) : (["rgba(22,104,240,0.20)", "rgba(0,207,232,0.08)"] as const);
  return (
    <Animated.View pointerEvents="none" style={[s.drop, { width: Math.max(slot - 4, 0), left, borderColor: dark ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.75)" }, style]}>
      <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  drop: { position: "absolute", top: 8, height: 54, borderRadius: 27, borderWidth: 1, overflow: "hidden" },
});
