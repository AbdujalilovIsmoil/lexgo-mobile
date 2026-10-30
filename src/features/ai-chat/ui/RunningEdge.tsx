import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useMotionOn } from "@/shared/lib/useMotionOn";

const RUN_MS = 2600;
const STREAK = 0.45; // the moving light, as a share of the edge

// The light along the AI input's lower edge: a faint violet-to-cyan line with a brighter streak running along it, left to right, while
// the AI screen is on view (useMotionOn); otherwise only the still line.
export function RunningEdge() {
  const on = useMotionOn();
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  useEffect(() => {
    if (!on || !w) return;
    x.set(0);
    x.set(withRepeat(withTiming(1, { duration: RUN_MS, easing: Easing.inOut(Easing.quad) }), -1, false));
    return () => cancelAnimation(x);
  }, [on, w, x]);
  const run = useAnimatedStyle(() => ({ transform: [{ translateX: -w * STREAK + x.get() * w * (1 + STREAK) }] }));
  return (
    <View pointerEvents="none" onLayout={(e) => setW(e.nativeEvent.layout.width)} style={s.edge}>
      <LinearGradient colors={["rgba(139,108,242,0)", "rgba(139,108,242,0.35)", "rgba(0,207,232,0.4)", "rgba(0,207,232,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      {w ? (
        <Animated.View style={[s.streak, { width: w * STREAK }, run]}>
          <LinearGradient colors={["rgba(139,108,242,0)", "#8B6CF2", "#00CFE8", "rgba(0,207,232,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  edge: { position: "absolute", left: 28, right: 28, bottom: -1.5, height: 2.5, borderRadius: 2, overflow: "hidden" },
  streak: { position: "absolute", top: 0, bottom: 0, left: 0 },
});
