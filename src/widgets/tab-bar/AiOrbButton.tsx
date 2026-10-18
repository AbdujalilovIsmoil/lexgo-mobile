import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { focused: boolean; onPress: () => void; labelKey: string };

// iOS centre action: a living "AI" orb — colour core, a sheen that keeps orbiting inside it, a soft pulse around it
// and a twinkling spark. (Android keeps the flat AiButton.)
export function AiOrbButton({ focused, onPress, labelKey }: Props) {
  const c = useColors();
  const { t } = useT();
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.linear }), -1);
    pulse.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }), -1);
  }, [spin, pulse]);
  const sheen = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const ring = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.55 }] }));
  const spark = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(spin.value * Math.PI * 4), transform: [{ scale: 0.85 + 0.2 * Math.sin(spin.value * Math.PI * 4) }] }));
  return (
    <PressableScale onPress={onPress} scale={0.9} style={s.wrap} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <View style={s.stage}>
        <Animated.View style={[s.pulse, ring]} />
        <View style={s.glow}>
          <LinearGradient colors={["#00CFE8", "#1668F0", "#7A5CFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.core}>
            <Animated.View style={[s.sheenBox, sheen]}><LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.42)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sheen} /></Animated.View>
            <Text style={s.ai}>AI</Text>
            <Animated.Text style={[s.spark, spark]}>✦</Animated.Text>
          </LinearGradient>
        </View>
      </View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} style={[s.label, { color: focused ? c.accent : c.gray2 }]}>{t(labelKey)}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", marginTop: -41, gap: 0 },
  stage: { width: 68, height: 68, alignItems: "center", justifyContent: "center" },
  pulse: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "#5FD9FF" },
  glow: { borderRadius: 30, shadowColor: "#1668F0", shadowOpacity: 0.55, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  core: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)" },
  sheenBox: { position: "absolute", width: 60, height: 60, alignItems: "center" },
  sheen: { width: 24, height: 60 },
  ai: { color: "#fff", fontFamily: "Onest_800ExtraBold", fontSize: 20, letterSpacing: 0.5 },
  spark: { position: "absolute", top: 10, right: 11, color: "#fff", fontSize: 11 },
  label: { fontSize: 10, lineHeight: 13 },
});
