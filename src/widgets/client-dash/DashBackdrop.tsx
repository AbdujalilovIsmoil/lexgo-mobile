import { Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { mainColor } from "@/shared/theme";

// The light theme's Home background: a vertical blue that fades into the page behind the ask field, done by the top of the first tiles — no hard
// edge where the hero ends.
// The light Home page ground: a soft whitish grey, so the pure-white cards stand apart from it.
export const HOME_BG = "#F2F4F7";
const BLUES = [mainColor, "#10499F", "#2865C1", "#80A9E5", "#DCE7F8"] as const;
const STOPS = [0, 0.3, 0.55, 0.72, 0.87, 1] as const;
// Soft light on the blue: one in the top right corner, one on the left edge, a little below the top left corner. Fixed sizes (the pictures' own), so a
// tablet does not blow them up. Part of each hangs off the screen.
const SHADOW_TOP_RIGHT = require("../../../assets/shadow1.png");
const SHADOW_LEFT = require("../../../assets/shadow2.png");

// `end`: where the fade ends, measured from the top of the screen (the top edge of the first tiles row and a little more).
function Blue({ end }: { end: number }) {
  return (
    <LinearGradient
      colors={[...BLUES, HOME_BG]} // the last stop is the page colour itself, so the fade ends exactly where the page begins
      locations={[...STOPS]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[s.top, { height: end }]}
    />
  );
}

function Shadows() {
  return (
    <>
      <Image source={SHADOW_TOP_RIGHT} style={s.topRight} />
      <Image source={SHADOW_LEFT} style={s.left} />
    </>
  );
}

// The backdrop, fixed to the screen behind the scroll view — not inside it: the native scroll moves content a frame before a Reanimated transform can answer, so a
// backdrop in the content that cancels the scroll jitters on every frame of an iOS pull. Scrolling up it leaves at the content's pace, the pictures staying still on
// the screen until it has gone. An iOS pull moves neither: nothing here changes, only the content comes down.
export function DashBackdrop({ end, scrollY }: { end: number; scrollY: SharedValue<number> }) {
  const leave = useAnimatedStyle(() => ({ transform: [{ translateY: -Math.max(scrollY.value, 0) }] }));
  const stay = useAnimatedStyle(() => ({ transform: [{ translateY: Math.max(scrollY.value, 0) }] }));
  return (
    <Animated.View pointerEvents="none" style={[s.clip, { height: end }, leave]}>
      <Blue end={end} />
      <Animated.View style={[StyleSheet.absoluteFill, stay]}>
        <Shadows />
      </Animated.View>
    </Animated.View>
  );
}

// The same picture, unmoving, for a layer fixed to the screen (DashTopBar): at rest it matches the scrolling backdrop exactly, so no edge shows. Fills its parent, which clips it.
export function BackdropStill({ end }: { end: number }) {
  return (
    <>
      <Blue end={end} />
      <Shadows />
    </>
  );
}

const s = StyleSheet.create({
  clip: { position: "absolute", top: 0, left: 0, right: 0, overflow: "hidden" },
  top: { position: "absolute", top: 0, left: 0, right: 0 },
  topRight: { position: "absolute", top: -80, right: -80, width: 320, height: 320 },
  left: { position: "absolute", top: 120, left: -80, width: 240, height: 240 },
});
