import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Zap } from "lucide-react-native";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Text } from "@/shared/ui";
import { useAppActive } from "@/shared/lib/useAppActive";
import { GLASS_SOLID, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { onPress: () => void; labelKey: string };

const SIZE = 56;
const R = 18;
const RING = 5;
const OUTER = SIZE + RING * 2;
const LABEL_TOP = 32; // where the other tabs' captions start (their 28 pt icon box + 4 pt gap)
const CYCLE_MS = 3000; // a light runs across the button every 3 s
const SWEEP_MS = 1100;

// The client's centre slot (Adliya .v11 .tab.mid .fab): Tezkor — a navy rounded square with the bolt, raised out of the bar in a ring of the bar's
// own colour, its caption navy and bold on the line of the others. A blue light runs across its face every three seconds (while the app is in
// front; still with Reduce Motion). A press opens the urgent advocate screen.
export function UrgentButton({ onPress, labelKey }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const calm = useReducedMotion();
  const active = useAppActive();
  const x = useSharedValue(0);
  useEffect(() => {
    if (calm || !active) return;
    x.set(0);
    x.set(withRepeat(withSequence(withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.quad) }), withDelay(CYCLE_MS - SWEEP_MS, withTiming(0, { duration: 0 }))), -1, false));
    return () => cancelAnimation(x);
  }, [calm, active, x]);
  const shine = useAnimatedStyle(() => ({ opacity: x.get() > 0 && x.get() < 1 ? 1 : 0, transform: [{ translateX: -SIZE + x.get() * SIZE * 2 }, { rotate: "20deg" }] }));
  return (
    <View style={s.slot}>
      <Pressable onPress={onPress} style={[s.ring, { backgroundColor: glass ? GLASS_SOLID : dark ? c.surface : "#FFFFFF" }]} accessibilityRole="button" accessibilityLabel={t(labelKey)}>
        <View collapsable={false} style={s.square}>
          <LinearGradient colors={["#13357A", "#0A1F44"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
          <Animated.View pointerEvents="none" style={[s.shine, shine]}>
            <LinearGradient colors={["rgba(59,108,240,0)", "rgba(59,108,240,0.95)", "rgba(59,108,240,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Zap size={24} color="#FFFFFF" />
        </View>
      </Pressable>
      <Text variant="caption" weight="bold" numberOfLines={1} maxFontSizeMultiplier={1.1} style={[s.label, { color: c.accentStrong }]}>
        {t(labelKey)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  slot: { flex: 1, alignItems: "center", minHeight: 56 },
  ring: {
    position: "absolute", top: LABEL_TOP - OUTER - 4, width: OUTER, height: OUTER, borderRadius: R + RING, padding: RING,
    ...Platform.select({ ios: { shadowColor: "#0A1F44", shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }, default: { elevation: 10 } }),
  },
  square: { flex: 1, borderRadius: R, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  shine: { position: "absolute", top: -SIZE * 0.4, bottom: -SIZE * 0.4, left: SIZE * 0.3, width: SIZE * 0.4 },
  label: { marginTop: LABEL_TOP, fontSize: 13, lineHeight: 16 },
});
