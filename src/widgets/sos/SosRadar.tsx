import { StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { Icon } from "@/shared/ui";
import { usePulse } from "@/shared/lib/usePulse";

const SIZE = 176;

// One wave: grows from the core and fades out; the three are half a turn apart so one is always spreading.
function Wave({ p, at }: { p: SharedValue<number>; at: number }) {
  const st = useAnimatedStyle(() => {
    const k = (p.value + at) % 1;
    return { opacity: interpolate(k, [0, 1], [0.7, 0]), transform: [{ scale: interpolate(k, [0, 1], [0.36, 1]) }] };
  });
  return <Animated.View style={[s.wave, st]} />;
}

// The alarm: red waves spreading out of a core that blinks like a beacon.
export function SosRadar() {
  const p = usePulse(2600);
  const b = usePulse(1100, true);
  const core = useAnimatedStyle(() => ({ opacity: interpolate(b.value, [0, 1], [0.55, 1]), transform: [{ scale: interpolate(b.value, [0, 1], [0.92, 1.08]) }] }));
  const glow = useAnimatedStyle(() => ({ opacity: interpolate(b.value, [0, 1], [0.1, 0.55]), transform: [{ scale: interpolate(b.value, [0, 1], [1, 1.5]) }] }));
  return (
    <View style={s.box} renderToHardwareTextureAndroid>
      {[0, 0.5].map((at) => <Wave key={at} p={p} at={at} />)}
      <Animated.View style={[s.glow, glow]} />
      <Animated.View style={[s.core, core]}><Icon name="alert-triangle" size={30} tone="white" /></Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  wave: { position: "absolute", width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 2, borderColor: "#FFFFFF" },
  glow: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "#FF4D6D" },
  core: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", backgroundColor: "#E11D48", borderWidth: 2, borderColor: "rgba(255,255,255,0.7)" },
});
