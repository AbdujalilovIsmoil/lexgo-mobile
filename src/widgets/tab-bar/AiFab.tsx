import { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { PressableScale, Text } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useAppActive } from "@/shared/lib/useAppActive";
import { useAiFabAway } from "@/shared/lib/aiFabAway";
import { fonts } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { freshAiChat } from "@/features/ai-chat";

const SIZE = 58;
const R = SIZE / 2; // a disc
const PULSE_MS = 2800;
const TWINKLE_MS = 3000;
export const AI_FAB_GAP = 14; // above the bar's top edge (Adliya --fabB 102 over an 88 bar)

// The floating AI button: a blue disc in the bottom right corner, above the tab bar — the sparkle over "AI". A ring breathes out of it and the
// sparkle twinkles while the app is in front (still with Reduce Motion). A press starts a new AI conversation. While the page under it is
// scrolled down (useAiFabAway) it slides off the right edge of the screen; a scroll up of 18 pt slides it back the same plain way.
export function AiFab({ bottom }: { bottom: number }) {
  const { t } = useT();
  const router = useRouter();
  const calm = useReducedMotion();
  const active = useAppActive();
  const away = useAiFabAway((s) => s.away);
  const off = useSharedValue(0);
  useEffect(() => {
    off.set(calm ? (away ? 1 : 0) : withTiming(away ? 1 : 0, { duration: 220, easing: Easing.inOut(Easing.quad) }));
  }, [away, calm, off]);
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: off.get() * (SIZE + 16 + 12) }] }));
  const p = useSharedValue(0);
  const tw = useSharedValue(0);
  useEffect(() => {
    if (calm || !active) return;
    p.set(0);
    tw.set(0);
    p.set(withRepeat(withTiming(1, { duration: PULSE_MS, easing: Easing.out(Easing.quad) }), -1, false));
    tw.set(withRepeat(withTiming(1, { duration: TWINKLE_MS, easing: Easing.inOut(Easing.sin) }), -1, false));
    return () => { cancelAnimation(p); cancelAnimation(tw); };
  }, [calm, active, p, tw]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - p.get()) * (p.get() > 0 ? 1 : 0), transform: [{ scale: 0.92 + p.get() * 0.3 }] }));
  const icon = useAnimatedStyle(() => {
    const k = Math.sin(Math.PI * tw.get()); // up at the middle of the beat and back
    return { transform: [{ rotate: `${k * 18}deg` }, { scale: 1 + k * 0.1 }] };
  });
  const open = () => {
    selectHaptic();
    freshAiChat(); // the AI button always opens a new conversation
    router.navigate("/(tabs)/ai" as never);
  };
  return (
    <Animated.View pointerEvents={away ? "none" : "box-none"} style={[s.wrap, { bottom }, slide]}>
      <Animated.View pointerEvents="none" style={[s.ring, ring]} />
      <PressableScale onPress={open} scale={0.92} haptic={false} accessibilityRole="button" accessibilityLabel={t("tabs.ai")} style={s.btn}>
        <Animated.View style={icon}><Ionicons name="sparkles" size={22} color="#FFFFFF" /></Animated.View>
        <Text maxFontSizeMultiplier={1} style={s.label}>AI</Text>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", right: 16, width: SIZE, height: SIZE },
  ring: { position: "absolute", left: -5, top: -5, right: -5, bottom: -5, borderRadius: R + 5, borderWidth: 2, borderColor: "#1D4ED8" },
  btn: {
    width: SIZE, height: SIZE, borderRadius: R, backgroundColor: "#1D4ED8", alignItems: "center", justifyContent: "center", gap: 2,
    ...Platform.select({ ios: { shadowColor: "#000000", shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 10 } }, default: { elevation: 10 } }),
  },
  label: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 10, lineHeight: 12, letterSpacing: 0.8 },
});
