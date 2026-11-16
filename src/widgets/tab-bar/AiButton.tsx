import { Platform, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Text } from "@/shared/ui";
import { useAppActive } from "@/shared/lib/useAppActive";
import { GLASS_SOLID, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useAiPulse } from "./useAiPulse";

type Props = { focused: boolean; onPress: () => void; labelKey: string };

const SIZE = 56;
const R = 18; // Adliya: a rounded square, not a disc
const RING = 5;
const OUTER = SIZE + RING * 2;
const LABEL_TOP = 32; // where the other tabs' captions start (their 28 pt icon box + 4 pt gap)

// The AI destination in the middle of the bar (Adliya): a deep navy rounded square with the sparkle, in a ring of the bar's own colour, raised
// above the bar with its "AI" caption on the line of the other captions, navy and bold. A light streak runs across the square, the sparkle
// swells and a soft glow breathes out for a few beats, then it all rests (useAiPulse).
export function AiButton({ focused, onPress, labelKey }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const pulse = useAiPulse(useAppActive(), undefined, SIZE);
  return (
    <View style={s.slot}>
      <Pressable onPress={onPress} style={[s.ring, { backgroundColor: glass ? GLASS_SOLID : dark ? c.surface : "#FFFFFF" }]} accessibilityRole="button" accessibilityLabel={t(labelKey)} accessibilityState={{ selected: focused }}>
        <Animated.View pointerEvents="none" style={[s.halo, pulse.ring]} />
        <View collapsable={false} style={s.square}>
          <LinearGradient colors={["#13357A", "#0A1F44"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
          <Animated.View pointerEvents="none" style={[s.shine, pulse.shine]}>
            <LinearGradient colors={["rgba(59,108,240,0)", "rgba(59,108,240,0.85)", "rgba(59,108,240,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={pulse.icon}><Ionicons name="sparkles" size={22} color="#FFFFFF" /></Animated.View>
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
  halo: { position: "absolute", left: RING, top: RING, width: SIZE, height: SIZE, borderRadius: R, backgroundColor: "#3B6CF0" },
  square: { flex: 1, borderRadius: R, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  shine: { position: "absolute", top: 0, bottom: 0, left: 0, width: SIZE * 0.5 },
  label: { marginTop: LABEL_TOP, fontSize: 13, lineHeight: 16 },
});
