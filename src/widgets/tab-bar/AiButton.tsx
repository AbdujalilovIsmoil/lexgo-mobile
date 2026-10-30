import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { PressableScale, Text } from "@/shared/ui";
import { useAppActive } from "@/shared/lib/useAppActive";
import { GLASS_SOLID, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useAiPulse } from "./useAiPulse";

type Props = { focused: boolean; onPress: () => void; labelKey: string };

const SIZE = 56;
const RING = 6;
const OUTER = SIZE + RING * 2;
const LABEL_TOP = 32; // where the other tabs' captions start (their 28 pt icon box + 4 pt gap)

// The AI destination in the middle of the bar: a deep navy disc with the sparkle, in a ring of the bar's own colour, raised above the bar
// with its "AI" caption on the line of the other captions. The sparkle swells and a soft ring breathes out for a few beats (useAiPulse).
export function AiButton({ focused, onPress, labelKey }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const pulse = useAiPulse(useAppActive());
  return (
    <View style={s.slot}>
      <PressableScale onPress={onPress} scale={0.92} style={[s.ring, { backgroundColor: glass ? GLASS_SOLID : dark ? c.surface : "#FFFFFF" }]} accessibilityRole="button" accessibilityLabel={t(labelKey)} accessibilityState={{ selected: focused }}>
        <Animated.View pointerEvents="none" style={[s.halo, pulse.ring]} />
        <LinearGradient colors={["#2A4C9C", "#13275E", "#0A1638"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={s.disc}>
          <Animated.View style={pulse.icon}><Ionicons name="sparkles" size={22} color="#FFFFFF" /></Animated.View>
        </LinearGradient>
      </PressableScale>
      <Text variant="caption" weight={focused ? "bold" : "medium"} numberOfLines={1} maxFontSizeMultiplier={1.1} style={[s.label, { color: focused ? c.ink : c.gray }]}>
        {t(labelKey)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  slot: { flex: 1, alignItems: "center", minHeight: 56 },
  ring: {
    position: "absolute", top: LABEL_TOP - OUTER - 4, width: OUTER, height: OUTER, borderRadius: OUTER / 2, padding: RING,
    ...Platform.select({ ios: { shadowColor: "#0B1F45", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 10 } }),
  },
  halo: { position: "absolute", left: RING, top: RING, width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: "#2F6BFF" },
  disc: { flex: 1, borderRadius: SIZE / 2, alignItems: "center", justifyContent: "center" },
  label: { marginTop: LABEL_TOP, fontSize: 13, lineHeight: 16 },
});
