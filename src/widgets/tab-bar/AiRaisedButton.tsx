import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { PressableScale } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { AiMark } from "./AiMark";
import { useT } from "@/shared/i18n";

type Props = { labelKey: string }; // the button's accessibility label

// The AI tab is always the middle slot of the system bar, so the button is simply centred on the screen. These match iOS 26's UITabBar
// and are the only numbers to tune if the button sits too high or low.
const BAR_LIFT = 6; // bar bottom above the safe area
const BAR_HEIGHT = 62;
const SIZE = 64;
const SHIFT = 12; // to the right: the bar's middle slot sits a little right of the screen centre (slot widths follow the captions)
const RISE = 8; // how far the disc stands above the bar's top edge

// iOS: the AI tab's slot in the system bar has no icon (no caption); this button stands over it, rising above the bar. A soft ring breathes out of it
// every few seconds — the only motion, off with Reduce Motion.
export function AiRaisedButton({ labelKey }: Props) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const insets = useInsets();
  const { width } = useWindowDimensions();
  const calm = useReducedMotion();
  const breath = useSharedValue(0);
  useEffect(() => {
    if (calm) return;
    breath.value = withRepeat(withDelay(900, withTiming(1, { duration: 2400, easing: Easing.out(Easing.cubic) })), -1);
  }, [breath, calm]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.38 * (1 - breath.value), transform: [{ scale: 1 + breath.value * 0.42 }] }));
  const bottom = insets.bottom + BAR_LIFT + (BAR_HEIGHT - SIZE) / 2 + RISE;
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <PressableScale
        onPress={() => { selectHaptic(); router.navigate("/(tabs)/ai" as never); }}
        scale={0.92}
        accessibilityRole="button"
        accessibilityLabel={t(labelKey)}
        style={[s.btn, { left: width / 2 - SIZE / 2 + SHIFT, bottom }]}
      >
        <Animated.View pointerEvents="none" style={[s.ring, { backgroundColor: c.accent }, ring]} />
        <View style={s.orb} />
        <View style={s.mark}><AiMark size={SIZE} calm={calm} /></View>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { position: "absolute", width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: SIZE - 6, height: SIZE - 6, borderRadius: SIZE / 2 },
  mark: { position: "absolute", width: SIZE, height: SIZE },
  orb: { width: SIZE - 4, height: SIZE - 4, borderRadius: SIZE / 2, backgroundColor: "#1668F0", shadowColor: "#1668F0", shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
});
