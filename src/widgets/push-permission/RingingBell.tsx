import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Icon, type IconName } from "@/shared/ui";

// A bell on a glass tile that swings every few seconds, with a soft ring pulsing outward.
export function RingingBell({ icon, color, ring }: { icon: IconName; color: string; ring: boolean }) {
  const a = useSharedValue(0);
  const p = useSharedValue(0);
  useEffect(() => {
    if (!ring) return;
    a.value = withRepeat(withSequence(withTiming(1, { duration: 110 }), withTiming(-1, { duration: 220 }), withTiming(1, { duration: 220 }), withTiming(0, { duration: 110 }), withDelay(2600, withTiming(0, { duration: 0 }))), -1);
    p.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1);
  }, [ring, a, p]);
  const swing = useAnimatedStyle(() => ({ transform: [{ rotate: `${a.value * 16}deg` }] }));
  const wave = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - p.value), transform: [{ scale: 1 + p.value * 0.55 }] }));
  return (
    <View style={s.box}>
      {ring ? <Animated.View pointerEvents="none" style={[s.wave, { borderColor: color }, wave]} /> : null}
      <View style={s.tile}><Animated.View style={swing}><Icon name={icon} size={26} color={color} /></Animated.View></View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { width: 56, height: 56 },
  tile: { width: 56, height: 56, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  wave: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, borderWidth: 2 },
});
