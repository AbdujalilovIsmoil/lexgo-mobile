import { useEffect, useState } from "react";
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, cancelAnimation, makeMutable, useAnimatedStyle, useReducedMotion, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAppActive } from "@/shared/lib/useAppActive";
import { radius, useTheme } from "@/shared/theme";

type Props = { width?: DimensionValue; height?: number; round?: number; onDark?: boolean; style?: StyleProp<ViewStyle> };

// One sweep for every placeholder on screen: a list of ten skeleton rows runs one animation (and they shine in step), not ten. It runs
// while at least one placeholder wants it and stops with the last one, or when the app goes to the background.
const x = makeMutable(-1);
let users = 0;
function useSweep(on: boolean) {
  useEffect(() => {
    if (!on) return;
    if (users++ === 0) {
      x.value = -1; // each repeat starts where the first one did
      x.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, false);
    }
    return () => {
      if (--users > 0) return;
      cancelAnimation(x);
      x.value = -1; // no light band left standing on a placeholder that does not sweep (Reduce Motion)
    };
  }, [on]);
}

// Placeholder block with a soft light sweep (shimmer) while data loads.
export function Skeleton({ width = "100%", height = 16, round = radius.sm, onDark, style }: Props) {
  const { colors, dark } = useTheme();
  const [w, setW] = useState(0);
  const calm = useReducedMotion();
  const active = useAppActive();
  useSweep(!calm && active);
  const sweep = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * w }] }));
  const base = onDark ? "rgba(255,255,255,0.12)" : colors.surface2;
  const light = onDark || dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.8)";
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[{ width, height, borderRadius: round, backgroundColor: base }, s.clip, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
        <LinearGradient colors={["transparent", light, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  clip: { overflow: "hidden" },
});
