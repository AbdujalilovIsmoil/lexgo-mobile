import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, type IconName } from "./Icon";

// Glowing AI orb: a gradient core with two soft rings that keep expanding and fading.
export function AiOrb({ size = 52, icon = "zap" }: { size?: number; icon?: IconName }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1); }, [p]);
  const ring = (delay: number) => useAnimatedStyle(() => { // eslint-disable-line react-hooks/rules-of-hooks
    const v = (p.value + delay) % 1;
    return { opacity: 0.5 * (1 - v), transform: [{ scale: 1 + v * 0.9 }] };
  });
  const a = ring(0), b = ring(0.5);
  return (
    <View style={[s.box, { width: size, height: size }]}>
      <Animated.View style={[s.ring, { width: size, height: size, borderRadius: size / 2 }, a]} />
      <Animated.View style={[s.ring, { width: size, height: size, borderRadius: size / 2 }, b]} />
      <LinearGradient colors={["#00CFE8", "#1668F0", "#7A5CFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.core, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}><Icon name={icon} size={Math.round(size * 0.44)} tone="white" /></LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", backgroundColor: "#5FD9FF" },
  core: { alignItems: "center", justifyContent: "center" },
});
