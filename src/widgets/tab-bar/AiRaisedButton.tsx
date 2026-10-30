import { StyleSheet, useWindowDimensions, View } from "react-native";
import { usePathname, useRouter, useSegments } from "expo-router";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LiquidGlass, PressableScale, useLiquidGlass } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useAppActive } from "@/shared/lib/useAppActive";
import { useInsets } from "@/shared/lib/insets";
import { useTablet } from "@/shared/lib/useTablet";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useAiPulse } from "./useAiPulse";

type Props = { labelKey: string; hidden?: boolean; shift?: number }; // labelKey: the button's accessibility label; hidden: the AI screen is up, so the button rests unseen (never unmounted); shift: how far right of the screen centre the bar's AI slot is

// The AI tab is always the middle slot of the system bar; the bar works out how far that slot is from the screen centre (`shift`). These match iOS 26's UITabBar
// and are the only numbers to tune if the button sits too high or low.
const BAR_LIFT = -11; // bar bottom relative to the safe area (the system bar floats a little below the home indicator line)
const BAR_HEIGHT = 62;
const SIZE_MAX = 64; // on a narrow screen the disc shrinks (16% of the width, 52–64 pt) so it never crowds the neighbouring captions
const TABLET_BOTTOM = 20; // a tablet: the button's distance above the bottom safe area
const RISE = 26; // how far the disc stands above the bar's top edge (high enough to leave the slot's "AI" caption under it)
const RING = 5;
const LIGHT = 3; // the turning light seen round the disc

// iOS: the AI tab's slot in the system bar has no icon (only the caption); this button stands over it, rising above the bar: the sparkle on a deep
// navy disc in a ring, both SwiftUI Liquid Glass (Expo UI) on iOS 26 — a solid navy disc in a ring of the theme's surface elsewhere. The slot
// keeps its "AI" caption under the button. On view (and again on every tab change) a light runs round the disc, the sparkle swells and turns
// and a glow breathes out of the button for a few beats, then it all rests (useAiPulse).
export function AiRaisedButton({ labelKey, hidden = false, shift = 0 }: Props) {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const router = useRouter();
  const insets = useInsets();
  const { width } = useWindowDimensions();
  const { tablet } = useTablet();
  const glass = useLiquidGlass();
  const onTabs = useSegments()[0] === "(tabs)";
  const active = useAppActive();
  const pulse = useAiPulse(!hidden && onTabs && active, usePathname());
  const size = tablet ? SIZE_MAX : Math.round(Math.min(SIZE_MAX, Math.max(52, width * 0.16)));
  const disc = size - RING * 2;
  const bottom = tablet ? insets.bottom + TABLET_BOTTOM : insets.bottom + BAR_LIFT + (BAR_HEIGHT - size) / 2 + RISE;
  // A tablet has no bar: the button sits at the bottom centre of the page itself (its container is the page beside the sidebar).
  const left = tablet ? { left: "50%" as const, marginLeft: -size / 2 } : { left: width / 2 - size / 2 + shift };
  return (
    <View pointerEvents={hidden ? "none" : "box-none"} style={[StyleSheet.absoluteFill, hidden && s.away]}>
      <Animated.View pointerEvents="none" style={[s.halo, { width: size, height: size, borderRadius: size / 2, bottom }, left, pulse.ring]} />
      <PressableScale
        onPress={() => { selectHaptic(); router.navigate("/(tabs)/ai" as never); }}
        scale={0.92}
        accessibilityRole="button"
        accessibilityLabel={t(labelKey)}
        style={[s.btn, { width: size, height: size, borderRadius: size / 2, bottom }, left, !glass && { backgroundColor: dark ? c.surface : "#FFFFFF" }]}
      >
        {glass ? <LiquidGlass width={size} height={size} shape="circle" interactive /> : null}
        <View pointerEvents="none" style={[s.rim, { width: disc + LIGHT * 2, height: disc + LIGHT * 2, borderRadius: disc / 2 + LIGHT }]}>
          <Animated.View style={[{ width: disc + LIGHT * 2, height: disc + LIGHT * 2 }, pulse.spin]}>
            <LinearGradient colors={["rgba(47,107,255,0)", "rgba(47,107,255,0)", "#2F6BFF", "#00CFE8", "#B9F1FF"]} locations={[0, 0.45, 0.7, 0.88, 1]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
        <View style={[s.disc, { width: disc, height: disc, borderRadius: disc / 2 }]}>
          {glass ? (
            <LiquidGlass width={disc} height={disc} shape="circle" interactive scheme="dark" tint="rgba(16,36,92,0.92)" />
          ) : (
            <LinearGradient colors={["#2A4C9C", "#13275E", "#0A1638"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
          )}
          <Animated.View style={pulse.icon}><Ionicons name="sparkles" size={Math.round(disc * 0.4)} color="#FFFFFF" /></Animated.View>
        </View>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  away: { opacity: 0 },
  btn: { position: "absolute", alignItems: "center", justifyContent: "center", shadowColor: "#0B1F45", shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  halo: { position: "absolute", backgroundColor: "#2F6BFF" },
  rim: { position: "absolute", overflow: "hidden" },
  disc: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
