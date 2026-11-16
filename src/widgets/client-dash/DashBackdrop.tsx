import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useTheme } from "@/shared/theme";

// Home's header band (Adliya): the navy gradient (150°, #13357A → #0A1F44) with its rounded bottom corners, and two faint rings in the top
// right corner. It runs from the top of the screen to the bottom of the hero (`end`); the page's light ground starts under it.
// The light Home page ground: the cool Adliya grey, so the white cards stand apart from it.
export const HOME_BG = "#F2F5FA";
export const BAND_RADIUS = 24;
const NAVY = ["#13357A", "#0A1F44", "#0A1F44"] as const;
const DARK_NAVY = ["#16408F", "#0C2350", "#0A1C40"] as const;
const STOPS = [0, 0.65, 1] as const;

// `end`: where the band ends, measured from the top of the screen (the hero's bottom edge); none: it fills its parent.
function Navy({ end }: { end?: number }) {
  const { dark } = useTheme();
  return (
    <LinearGradient
      colors={[...(dark ? DARK_NAVY : NAVY)]}
      locations={[...STOPS]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={end ? [s.top, { height: end }] : StyleSheet.absoluteFill}
    />
  );
}

// The decoration of .j-hd::after: a hairline circle with two soft halos, hanging off the top right corner.
function Rings() {
  return (
    <View pointerEvents="none" style={s.rings}>
      <View style={[s.ring, s.halo2]} />
      <View style={[s.ring, s.halo1]} />
      <View style={[s.ring, s.core]} />
    </View>
  );
}

// The backdrop, fixed to the screen behind the scroll view — not inside it: the native scroll moves content a frame before a Reanimated transform can answer, so a
// backdrop in the content that cancels the scroll jitters on every frame of an iOS pull. Scrolling up it leaves at the content's pace; an iOS pull
// stretches it down by the pull, so the chips never leave the band.
export function DashBackdrop({ end, scrollY }: { end: number; scrollY: SharedValue<number> }) {
  const follow = useAnimatedStyle(() => ({ height: end + Math.max(-scrollY.value, 0), transform: [{ translateY: -Math.max(scrollY.value, 0) }] }));
  return (
    <Animated.View pointerEvents="none" style={[s.clip, s.round, follow]}>
      <Navy />
      <Rings />
    </Animated.View>
  );
}

// The same picture, unmoving, for a layer fixed to the screen (DashTopBar): at rest it matches the scrolling backdrop exactly, so no edge shows. Fills its parent, which clips it.
export function BackdropStill({ end }: { end: number }) {
  return (
    <>
      <Navy end={end} />
      <Rings />
    </>
  );
}

const RING = 180;
const s = StyleSheet.create({
  clip: { position: "absolute", top: 0, left: 0, right: 0, overflow: "hidden" },
  round: { borderBottomLeftRadius: BAND_RADIUS, borderBottomRightRadius: BAND_RADIUS },
  top: { position: "absolute", top: 0, left: 0, right: 0 },
  rings: { position: "absolute", top: -30 - 40, right: -50 - 40, width: RING + 80, height: RING + 80 },
  ring: { position: "absolute", borderRadius: 999 },
  halo2: { left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.02)" },
  halo1: { left: 20, top: 20, right: 20, bottom: 20, backgroundColor: "rgba(255,255,255,0.025)" },
  core: { left: 40, top: 40, right: 40, bottom: 40, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
});
