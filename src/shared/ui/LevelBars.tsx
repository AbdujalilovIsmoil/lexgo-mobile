import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

function Bar({ i, color, height, live }: { i: number; color: string; height: number; live: boolean }) {
  const k = useSharedValue(0.25);
  const calm = useReducedMotion();
  useEffect(() => {
    if (!live || calm) {
      cancelAnimation(k);
      k.value = withTiming(live ? 0.6 : 0.25, { duration: 200 });
      return;
    }
    const ms = 380 + ((i * 97) % 5) * 70;
    k.value = withDelay(i * 60, withRepeat(withSequence(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.quad) }), withTiming(0.2, { duration: ms, easing: Easing.inOut(Easing.quad) })), -1));
    return () => cancelAnimation(k);
  }, [k, i, live, calm]);
  const st = useAnimatedStyle(() => ({ height: Math.max(4, k.value * height) }));
  return <Animated.View style={[s.bar, { backgroundColor: color }, st]} />;
}

// A row of bars that rise and fall like a voice level meter while `live`, and rest low otherwise.
export function LevelBars({ color, count = 11, height = 30, live = true }: { color: string; count?: number; height?: number; live?: boolean }) {
  return <View style={[s.row, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{Array.from({ length: count }, (_, i) => <Bar key={i} i={i} color={color} height={height} live={live} />)}</View>;
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 4 }, bar: { width: 4, borderRadius: 2 } });
