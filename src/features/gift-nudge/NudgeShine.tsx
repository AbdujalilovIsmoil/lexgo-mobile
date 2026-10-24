import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useMotionOn } from "@/shared/lib/useMotionOn";

// .giftn::before — a soft light band sweeping across the banner every few seconds.
export function NudgeShine() {
  const [w, setW] = useState(0);
  const x = useSharedValue(-1);
  const motion = useMotionOn(); // the banner sits in every tab header: only the page in view sweeps
  useEffect(() => {
    if (!motion) return;
    x.value = withRepeat(withSequence(withDelay(1200, withTiming(1, { duration: 1800 })), withDelay(1200, withTiming(-1, { duration: 0 }))), -1);
    return () => { cancelAnimation(x); x.value = -1; };
  }, [x, motion]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: (x.value + 1) * 0.65 * w - w * 0.4 }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Animated.View style={[s.band, { width: w * 0.38 }, st]}>
        <LinearGradient colors={["transparent", "rgba(255,255,255,0.45)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({ band: { position: "absolute", top: 0, bottom: 0, left: 0 } });
