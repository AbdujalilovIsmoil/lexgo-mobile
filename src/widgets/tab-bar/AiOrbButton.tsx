import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { PressableScale, Text } from "@/shared/ui";
import { useColors, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { loadGlass } from "@/shared/lib/glass";

type Props = { focused: boolean; onPress: () => void; labelKey: string };

const GLASS = loadGlass();
const SIZE = 58;

// iOS centre action: a lens of liquid glass with a slow aurora drifting under it, so the glass bends living colour. The "AI" mark sits
// on top, with a small twinkle. Without iOS 26 glass the lens is a soft frosted gradient. (Android keeps the flat AiButton.)
export function AiOrbButton({ focused, onPress, labelKey }: Props) {
  const c = useColors();
  const { dark } = useTheme();
  const { t } = useT();
  const drift = useSharedValue(0);
  const twinkle = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);
    twinkle.value = withRepeat(withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1300 })), -1);
  }, [drift, twinkle]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: -14 + drift.value * 28 }, { translateY: 8 - drift.value * 16 }] }));
  const b = useAnimatedStyle(() => ({ transform: [{ translateX: 16 - drift.value * 30 }, { translateY: -10 + drift.value * 18 }] }));
  const spark = useAnimatedStyle(() => ({ opacity: 0.4 + 0.6 * twinkle.value, transform: [{ scale: 0.8 + 0.25 * twinkle.value }] }));
  return (
    <PressableScale onPress={onPress} scale={0.92} style={s.wrap} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <View style={[s.stage, s.shadow]}>
        <View style={s.lens}>
          <Animated.View style={[s.blob, { backgroundColor: "#19D3F0", left: -6, top: 4 }, a]} />
          <Animated.View style={[s.blob, { backgroundColor: "#8B5CFF", right: -6, bottom: 2 }, b]} />
          {GLASS ? (
            <GLASS.View glassEffectStyle="regular" isInteractive colorScheme={dark ? "dark" : "light"} tintColor="rgba(22,104,240,0.18)" style={[StyleSheet.absoluteFill, s.round]} />
          ) : (
            <LinearGradient colors={["rgba(255,255,255,0.45)", "rgba(255,255,255,0.08)"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
          )}
          <View style={[StyleSheet.absoluteFill, s.rim]} pointerEvents="none" />
          <Text style={s.ai}>AI</Text>
          <Animated.Text style={[s.spark, spark]}>✦</Animated.Text>
        </View>
      </View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} style={[s.label, { color: focused ? c.accent : c.ink, opacity: focused ? 1 : 0.78 }]}>{t(labelKey)}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", marginTop: -38, gap: 2 },
  stage: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  shadow: { borderRadius: SIZE / 2, shadowColor: "#1668F0", shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  lens: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "rgba(22,104,240,0.35)" },
  round: { borderRadius: SIZE / 2 },
  blob: { position: "absolute", width: 40, height: 40, borderRadius: 20, opacity: 0.85 },
  rim: { borderRadius: SIZE / 2, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.55)" },
  ai: { color: "#fff", fontFamily: "Onest_800ExtraBold", fontSize: 19, letterSpacing: 0.5, textShadowColor: "rgba(10,40,120,0.35)", textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  spark: { position: "absolute", top: 10, right: 11, color: "#fff", fontSize: 10 },
  label: { fontSize: 10, lineHeight: 13 },
});
