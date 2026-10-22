import { useEffect } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { PressableScale } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { index: number; count: number; labelKey: string }; // labelKey: the button's accessibility label

// The system bar floats ~21pt in from each edge; its slots share the rest equally. These match iOS 26's UITabBar and are the only
// numbers to tune if the button drifts from its slot.
const BAR_INSET = 21;
const BAR_LIFT = 12; // bar bottom above the safe area
const BAR_HEIGHT = 62;
const SIZE = 64;
const RISE = 22; // how far the disc stands above the bar's top edge

const ORB = require("../../../assets/tabs/ai-orb.png");

// iOS: the AI tab's slot in the system bar has no icon (no caption); this button stands over it, rising above the bar. A soft ring breathes out of it
// every few seconds — the only motion, off with Reduce Motion.
export function AiRaisedButton({ index, count, labelKey }: Props) {
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
  const slot = (width - BAR_INSET * 2) / Math.max(count, 1);
  const centerX = count % 2 === 1 && index === (count - 1) / 2 ? width / 2 : BAR_INSET + slot * (index + 0.5);
  const bottom = insets.bottom + BAR_LIFT + BAR_HEIGHT - SIZE + RISE - 6;
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <PressableScale
        onPress={() => { selectHaptic(); router.navigate("/(tabs)/ai" as never); }}
        scale={0.92}
        accessibilityRole="button"
        accessibilityLabel={t(labelKey)}
        style={[s.btn, { left: centerX - SIZE / 2, bottom }]}
      >
        <Animated.View pointerEvents="none" style={[s.ring, { backgroundColor: c.accent }, ring]} />
        <Image source={ORB} style={s.orb} />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { position: "absolute", width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: SIZE - 6, height: SIZE - 6, borderRadius: SIZE / 2 },
  orb: { width: SIZE, height: SIZE, shadowColor: "#1668F0", shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
});
