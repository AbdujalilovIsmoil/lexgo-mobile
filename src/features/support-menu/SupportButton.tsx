import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Icon, PressableScale } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useSheetsOpen } from "@/shared/lib/sheetsOpen";

const EVERY = 7000;

// One soft ring spreading out of the button (.psup__wave).
function Wave({ p, color }: { p: { value: number }; color: string }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - p.value), transform: [{ scale: 1 + p.value * 0.5 }] }));
  return <Animated.View pointerEvents="none" renderToHardwareTextureAndroid style={[s.wave, { borderColor: color }, st]} />;
}

// The header headset. Its two rings and the small wiggle play ONCE every few seconds (a timer starts them), so between
// two plays nothing animates and the screen is not redrawn every frame (a never-ending animation cost a quarter of the frames).
export function SupportButton({ onPress, label, glass, active }: { onPress: () => void; label: string; glass?: boolean; active?: boolean }) {
  const c = useColors();
  const covered = useSheetsOpen((st) => st.n > 0);
  const a = useSharedValue(0);
  const b = useSharedValue(1);
  const w = useSharedValue(0);
  useEffect(() => {
    if (active || covered) return;
    const play = () => {
       
      a.value = 0; a.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) });
      b.value = 0; setTimeout(() => { b.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }); }, 700);
      w.value = withSequence(withTiming(1, { duration: 150 }), withTiming(-1, { duration: 300 }), withTiming(0, { duration: 150 }));
       
    };
    const first = setTimeout(play, 2000);
    const id = setInterval(play, EVERY);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [active, covered, a, b, w]);
  const icon = useAnimatedStyle(() => ({ transform: [{ rotate: `${w.value * 10}deg` }] }));
  const ring = glass ? "rgba(255,255,255,0.6)" : "rgba(22,104,240,0.55)";
  return (
    <View style={s.box}>
      {active || covered ? null : <><Wave p={a} color={ring} /><Wave p={b} color={ring} /></>}
      <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={[s.btn, { backgroundColor: glass ? "rgba(255,255,255,0.14)" : c.tint2 }]}>
        <Animated.View style={icon}><Icon name="headphones" size={19} color={glass ? "#FFFFFF" : c.accent} /></Animated.View>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  box: { width: 40, height: 40 },
  btn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  wave: { position: "absolute", top: -1, left: -1, right: -1, bottom: -1, borderRadius: 21, borderWidth: 2 },
});
