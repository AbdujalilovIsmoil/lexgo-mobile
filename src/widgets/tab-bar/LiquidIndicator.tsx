import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "@/shared/theme";

type Props = { index: number; slot: number; hidden: boolean; left: number };

const GLASS = isLiquidGlassAvailable();

// The lens under the active tab: a pill of liquid glass (a tinted gradient where the system has none) that slides to the tab
// you press — or follows your finger while you drag along the bar — and settles without any wobble.
export function LiquidIndicator({ index, slot, hidden, left }: Props) {
  const { dark } = useTheme();
  const x = useSharedValue(index * slot);
  const show = useSharedValue(hidden ? 0 : 1);
  useEffect(() => {
    x.value = withSpring(index * slot, { damping: 20, stiffness: 260, mass: 0.8 });
    show.value = withSpring(hidden ? 0 : 1, { damping: 18, stiffness: 240 });
  }, [index, slot, hidden, x, show]);
  const style = useAnimatedStyle(() => ({ opacity: show.value, transform: [{ translateX: x.value }, { scale: 0.9 + 0.1 * show.value }] }));
  const width = Math.max(slot - 4, 0);
  if (GLASS) {
    return (
      <Animated.View pointerEvents="none" style={[s.drop, { width, left }, style]}>
        <GlassView glassEffectStyle="regular" isInteractive tintColor={dark ? "rgba(255,255,255,0.10)" : "rgba(22,104,240,0.14)"} style={StyleSheet.absoluteFill} />
      </Animated.View>
    );
  }
  const colors = dark ? (["rgba(255,255,255,0.24)", "rgba(255,255,255,0.08)"] as const) : (["rgba(22,104,240,0.20)", "rgba(0,207,232,0.08)"] as const);
  return (
    <Animated.View pointerEvents="none" style={[s.drop, s.flat, { width, left, borderColor: dark ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.75)" }, style]}>
      <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  drop: { position: "absolute", top: 8, height: 54, borderRadius: 27, overflow: "hidden" },
  flat: { borderWidth: 1 },
});
