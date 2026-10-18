import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

// A "this is happening now" light: the core fades on and off while a ring spreads out from it and vanishes.
// Used in front of status labels whose process is still running (in progress, waiting for the other side).
export function LiveDot({ color, size = 8 }: { color: string; size?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) })), -1);
  }, [t]);
  const core = useAnimatedStyle(() => ({ opacity: 0.25 + 0.75 * (1 - t.value) }));
  const ring = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - t.value), transform: [{ scale: 1 + t.value * 1.6 }] }));
  return (
    <View style={[s.box, { width: size + 8, height: size + 8 }]} pointerEvents="none">
      <Animated.View style={[s.abs, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, ring]} />
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, core]} />
    </View>
  );
}

const s = StyleSheet.create({ box: { alignItems: "center", justifyContent: "center" }, abs: { position: "absolute" } });
