import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { displayName, useSession } from "@/entities/session";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { FocusStatusBar } from "@/shared/ui";
import { gradient, palette, useTheme } from "@/shared/theme";
import { HeroTopRow } from "@/widgets/home-hero/HeroTopRow";
import { BackdropStill } from "./DashBackdrop";

const SHADOW = ["rgba(11,31,69,0.12)", "rgba(11,31,69,0)"] as const;

type Props = { end: number; scrollY: SharedValue<number>; onLayout: (e: LayoutChangeEvent) => void };

// Points of scroll at which the bar's ground appears, and the lower point at which it goes again. The gap between them keeps a finger resting near one point from
// switching it back and forth. The dark themes start sooner: their bar has no ground at rest, and the page is under it almost at once.
const LIGHT = { on: 56, off: 24 };
const DARK = { on: 24, off: 8 };
const FADE_MS = 280;

// Home's menu button, greeting and header buttons: fixed to the top of the screen, the page scrolling away under them.
// Light theme: the ground is the backdrop itself, clipped, so at rest there is nothing to see of the bar; further down the page it turns white, and half way there
// the row and the status bar change to dark type. The dark themes have a hero with its own diagonal gradient, so their bar is clear at rest and turns solid.
// The change runs on a timer once a point is passed, not with the scroll: following the finger, the ground shook with every small move near the top of the page.
export function DashTopBar({ end, scrollY, onLayout }: Props) {
  const insets = useInsets();
  const { dark } = useTheme();
  const name = displayName(useSession()?.user);
  const [scrolled, setScrolled] = useState(false);
  const { on, off } = dark ? DARK : LIGHT;
  const past = useSharedValue(false);
  const ground = useSharedValue(0);
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      const now = past.value ? y > off : y > on;
      if (now === past.value) return;
      past.value = now;
      ground.value = withTiming(now ? 1 : 0, { duration: FADE_MS });
    },
  );
  useAnimatedReaction(
    () => ground.value > 0.5,
    (now, before) => {
      if (now !== before) scheduleOnRN(setScrolled, now);
    },
  );
  const fade = useAnimatedStyle(() => ({ opacity: ground.value }));
  const onWhite = scrolled && !dark;
  return (
    <View onLayout={onLayout} style={[s.bar, { paddingTop: insets.top + HEADER_GAP }]}>
      {onWhite ? <FocusStatusBar style="dark" /> : null}
      <View pointerEvents="none" style={s.ground}>
        {dark ? null : <BackdropStill end={end} />}
        <Animated.View style={[s.ground, dark ? s.solid : s.white, fade]} />
      </View>
      {/* The shadow under the bar, appearing with its ground. A gradient strip: an Android elevation would lift it over the row. */}
      <Animated.View pointerEvents="none" style={[s.shadow, fade]}>
        <LinearGradient colors={SHADOW} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <HeroTopRow name={name} onWhite={onWhite} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 8 },
  ground: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
  solid: { backgroundColor: gradient.dark[0] },
  white: { backgroundColor: palette.white },
  shadow: { position: "absolute", bottom: -12, left: 0, right: 0, height: 12 },
});
