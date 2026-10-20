import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

// One sparkline column: rises from its floor to `height`, `index` staggers the columns left to right.
export function SparkBar({ index, height, color }: { index: number; height: number; color: string }) {
  const calm = useReducedMotion();
  const p = useSharedValue(calm ? 1 : 0);
  useEffect(() => {
    if (calm) { p.value = 1; return; }
    p.value = 0;
    p.value = withDelay(180 + index * 80, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [calm, height, index, p]);
  const st = useAnimatedStyle(() => ({ height: 4 + (height - 4) * p.value }));
  return <Animated.View style={[s.bar, { backgroundColor: color }, st]} />;
}

const s = StyleSheet.create({ bar: { flex: 1, maxWidth: 28, borderRadius: 4 } });
