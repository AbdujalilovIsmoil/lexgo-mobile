import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { PressableScale } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { useTablet } from "@/shared/lib/useTablet";
import { useColors } from "@/shared/theme";
import { AiMark } from "./AiMark";
import { useT } from "@/shared/i18n";

type Props = { labelKey: string }; // the button's accessibility label

// The AI tab is always the middle slot of the system bar, so the button is simply centred on the screen. These match iOS 26's UITabBar
// and are the only numbers to tune if the button sits too high or low.
const BAR_LIFT = -11; // bar bottom relative to the safe area (the system bar floats a little below the home indicator line)
const BAR_HEIGHT = 62;
const SIZE_MAX = 64; // on a narrow screen the disc shrinks (16% of the width, 52–64 pt) so it never crowds the neighbouring captions
const SHIFT = 13; // to the right: the bar's middle slot sits a little right of the screen centre (slot widths follow the captions)
const TABLET_BOTTOM = 20; // a tablet: the button's distance above the bottom safe area
const RISE = 8; // how far the disc stands above the bar's top edge

// iOS: the AI tab's slot in the system bar has no icon (no caption); this button stands over it, rising above the bar. A soft ring breathes out of it
// every few seconds — the only motion, off with Reduce Motion.
export function AiRaisedButton({ labelKey }: Props) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const insets = useInsets();
  const { width } = useWindowDimensions();
  const { tablet } = useTablet();
  const size = tablet ? SIZE_MAX : Math.round(Math.min(SIZE_MAX, Math.max(52, width * 0.16)));
  const calm = useReducedMotion();
  const breath = useSharedValue(0);
  useEffect(() => {
    if (calm) return;
    breath.value = withRepeat(withDelay(900, withTiming(1, { duration: 2400, easing: Easing.out(Easing.cubic) })), -1);
  }, [breath, calm]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.38 * (1 - breath.value), transform: [{ scale: 1 + breath.value * 0.42 }] }));
  const bottom = tablet ? insets.bottom + TABLET_BOTTOM : insets.bottom + BAR_LIFT + (BAR_HEIGHT - size) / 2 + RISE;
  // A tablet has no bar: the button sits at the bottom centre of the page itself (its container is the page beside the sidebar).
  const left = tablet ? { left: "50%" as const, marginLeft: -size / 2 } : { left: width / 2 - size / 2 + SHIFT };
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <PressableScale
        onPress={() => { selectHaptic(); router.navigate("/(tabs)/ai" as never); }}
        scale={0.92}
        accessibilityRole="button"
        accessibilityLabel={t(labelKey)}
        style={[s.btn, { width: size, height: size, bottom }, left]}
      >
        <Animated.View pointerEvents="none" style={[s.ring, { width: size - 6, height: size - 6, borderRadius: size / 2, backgroundColor: c.accent }, ring]} />
        <View style={[s.orb, { width: size - 4, height: size - 4, borderRadius: size / 2 }]} />
        <View style={[s.mark, { width: size, height: size }]}><AiMark size={size} calm={calm} /></View>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { position: "absolute", alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute" },
  mark: { position: "absolute" },
  orb: { backgroundColor: "#1668F0", shadowColor: "#1668F0", shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
});
