import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { PressableScale, Text } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useAppActive } from "@/shared/lib/useAppActive";
import { useAiFabAction, useAiFabAway } from "@/shared/lib/aiFabAway";
import { fonts } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { freshAiChat } from "@/features/ai-chat";

const SIZE = 58;
const R = SIZE / 2; // a disc (or the pill's round ends)
const PULSE_MS = 2800;
const TWINKLE_MS = 3000;
const PILL_LIFT = 50; // the pill ("Muammoni yozing") sits a little higher than the disc
export const AI_FAB_GAP = 14; // above the bar's top edge (Adliya --fabB 102 over an 88 bar)

// The floating AI button: a blue disc in the bottom right corner, above the tab bar — the sparkle over "AI". A ring breathes out of it and the
// sparkle twinkles while the app is in front (still with Reduce Motion). A press starts a new AI conversation. While the page under it is
// scrolled down (useAiFabAway) it slides off the right edge of the screen; a scroll up of 18 pt slides it back the same plain way.
// A page may give it its own job (useAiFabAction): with a label it becomes a pill — the sparkle, the label and a line under it — same colour,
// same ring and twinkle, same leaving on scroll.
export function AiFab({ bottom }: { bottom: number }) {
  const { t } = useT();
  const router = useRouter();
  const calm = useReducedMotion();
  const active = useAppActive();
  const away = useAiFabAway((s) => s.away);
  const own = useAiFabAction((s) => s.action);
  const ownLabel = useAiFabAction((s) => s.label);
  const ownSub = useAiFabAction((s) => s.sub);
  const pill = !!own && !!ownLabel;
  const [w, setW] = useState(SIZE);
  const width = pill ? w : SIZE;
  const off = useSharedValue(0);
  useEffect(() => {
    off.set(calm ? (away ? 1 : 0) : withTiming(away ? 1 : 0, { duration: 220, easing: Easing.inOut(Easing.quad) }));
  }, [away, calm, off]);
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: off.get() * (width + 16 + 12) }] }));
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
  // The disc's ring grows all round; the pill's grows less (it is wide), so it stays a soft halo.
  const ring = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - p.get()) * (p.get() > 0 ? 1 : 0), transform: [{ scale: (pill ? 0.97 : 0.92) + p.get() * (pill ? 0.08 : 0.3) }] }));
  const icon = useAnimatedStyle(() => {
    const k = Math.sin(Math.PI * tw.get()); // up at the middle of the beat and back
    return { transform: [{ rotate: `${k * 18}deg` }, { scale: 1 + k * 0.1 }] };
  });
  const open = () => {
    selectHaptic();
    if (own) return own(); // the page in view gave the button its own job (the directory's AI search)
    freshAiChat(); // the AI button always opens a new conversation
    router.navigate("/(tabs)/ai" as never);
  };
  return (
    <Animated.View
      pointerEvents={away ? "none" : "box-none"}
      onLayout={pill ? (e) => setW(Math.round(e.nativeEvent.layout.width)) : undefined}
      style={[s.wrap, { bottom: pill ? bottom + PILL_LIFT : bottom }, pill ? null : { width: SIZE }, slide]}
    >
      <Animated.View pointerEvents="none" style={[s.ring, ring]} />
      <PressableScale onPress={open} scale={pill ? 0.96 : 0.92} haptic={false} accessibilityRole="button" accessibilityLabel={pill ? `${ownLabel}. ${ownSub}` : t("tabs.ai")} style={[s.btn, pill ? s.pill : s.disc]}>
        {pill ? (
          <>
            <View style={s.spark}><Animated.View style={icon}><Ionicons name="sparkles" size={19} color="#FFFFFF" /></Animated.View></View>
            <View style={s.texts}>
              <Text weight="bold" numberOfLines={1} maxFontSizeMultiplier={1.1} style={s.pillT}>{ownLabel}</Text>
              {ownSub ? <Text numberOfLines={1} maxFontSizeMultiplier={1.1} style={s.pillSub}>{ownSub}</Text> : null}
            </View>
          </>
        ) : (
          <>
            <Animated.View style={icon}><Ionicons name="sparkles" size={22} color="#FFFFFF" /></Animated.View>
            <Text maxFontSizeMultiplier={1} style={s.label}>AI</Text>
          </>
        )}
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", right: 16, height: SIZE },
  ring: { position: "absolute", left: -5, top: -5, right: -5, bottom: -5, borderRadius: R + 5, borderWidth: 2, borderColor: "#1D4ED8" },
  btn: {
    height: SIZE, borderRadius: R, backgroundColor: "#1D4ED8", alignItems: "center", justifyContent: "center", gap: 2,
    ...Platform.select({ ios: { shadowColor: "#000000", shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 10 } }, default: { elevation: 10 } }),
  },
  disc: { width: SIZE },
  // the pill takes the width of its content (no fixed width at all — a leftover one clipped the label)
  pill: { flexDirection: "row", gap: 10, paddingLeft: 10, paddingRight: 22, justifyContent: "flex-start" },
  spark: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  texts: { gap: 1 },
  pillT: { color: "#FFFFFF", fontSize: 15, lineHeight: 19 },
  pillSub: { color: "rgba(255,255,255,0.82)", fontSize: 11.5, lineHeight: 14, fontFamily: fonts.medium },
  label: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 10, lineHeight: 12, letterSpacing: 0.8 },
});
