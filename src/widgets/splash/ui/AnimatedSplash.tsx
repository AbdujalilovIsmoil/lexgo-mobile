import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, type LayoutChangeEvent } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSplashTimeline } from "../model/useSplashTimeline";
import { LogoCanvas } from "./LogoCanvas";
import { Wordmark } from "./Wordmark";

const LOGO = 160; // = "imageWidth" of expo-splash-screen in app.json, so the native splash hands over seamlessly
const GAP = 22; // between the mark and the name
const FONT = 21; // "Tezkor"; "Himoya" is 1.7× this

// Full-screen intro over the app. The mark is already there (the native splash draws the same
// mark at the same spot), the name rises in under it, then the mark zooms into the screen while
// the splash fades, revealing the app already rendered underneath.
export function AnimatedSplash({ onDone, ready, fontsReady }: { onDone: () => void; ready: boolean; fontsReady: boolean }) {
  // The real size of the full-screen overlay (the native splash centres in the whole window,
  // which can differ from useWindowDimensions with edge-to-edge on Android).
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
  };
  const t = useSplashTimeline(onDone, ready, fontsReady);
  // Fade starts once the zoom is under way, so the mark visibly flies at the viewer first.
  const fade = useAnimatedStyle(() => ({ opacity: interpolate(t.exit.value, [0, 0.35, 1], [1, 1, 0]) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, s.root, fade]} onLayout={onLayout}>
      <StatusBar style="light" />
      {box ? (
        <>
          <LogoCanvas w={box.w} h={box.h} size={LOGO} exit={t.exit} reduceMotion={t.reduceMotion} />
          <Wordmark top={box.h / 2 + LOGO / 2 + GAP} font={FONT} word={t.word} exit={t.exit} />
        </>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { backgroundColor: "#03102B", zIndex: 100 },
});
