import { useEffect } from "react";
import { StyleSheet, Text as RNText, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import type { NudgeVariant } from "./variants";

// .giftn__ic: 46px gradient tile, the glyph wiggles and a small ✦ twinkles on the corner.
export function NudgeIcon({ v }: { v: NudgeVariant }) {
  const w = useSharedValue(0);
  const tw = useSharedValue(0.35);
  useEffect(() => {
    w.value = withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(-1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1800 })), -1);
    tw.value = withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0.35, { duration: 1000 })), -1);
  }, [w, tw]);
  const wiggle = useAnimatedStyle(() => ({ transform: [{ rotate: `${w.value * 8}deg` }] }));
  const spark = useAnimatedStyle(() => ({ opacity: tw.value, transform: [{ scale: 0.8 + tw.value * 0.3 }] }));
  const dark = v.key === "pro" ? "#7A4B00" : "#FFFFFF";
  return (
    <View style={s.wrap}>
      <LinearGradient colors={v.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, { shadowColor: v.colors[1] }]}>
        <Animated.View style={wiggle}><MaterialCommunityIcons name={v.glyph} size={26} color={dark} /></Animated.View>
      </LinearGradient>
      <Animated.View style={[s.spark, spark]}><RNText style={s.star}>✦</RNText></Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 46, height: 46 },
  tile: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  spark: { position: "absolute", top: -6, right: -4 },
  star: { fontSize: 13, color: "#FB923C" },
});
