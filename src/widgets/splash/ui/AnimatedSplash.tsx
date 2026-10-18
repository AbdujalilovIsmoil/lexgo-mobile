import { StatusBar } from "expo-status-bar";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSplashTimeline } from "../model/useSplashTimeline";
import { useSplashTouch } from "../model/useSplashTouch";
import { Backdrop } from "./Backdrop";
import { LogoCanvas } from "./LogoCanvas";
import { Sparkles } from "./Sparkles";
import { TouchLayer } from "./TouchLayer";
import { Wordmark } from "./Wordmark";

// Full-screen animated intro drawn on a Skia canvas. Drag to tilt the logo,
// tap for ripples, swipe up to skip. Dismisses itself after a few seconds.
export function AnimatedSplash({ onDone, ready }: { onDone: () => void; ready: boolean }) {
  const { width, height } = useWindowDimensions();
  const t = useSplashTimeline(onDone, ready);
  const touch = useSplashTouch(t.leave);
  const fade = useAnimatedStyle(() => ({ opacity: 1 - t.exit.value, transform: [{ scale: 1 + t.exit.value * 0.06 }] }));
  return (
    <GestureDetector gesture={touch.gesture}>
      <Animated.View style={[StyleSheet.absoluteFill, s.root, fade]}>
        <StatusBar style="light" />
        <Backdrop w={width} h={height} time={t.time} tx={touch.tx} ty={touch.ty} bg={t.bg} />
        <Sparkles w={width} h={height} time={t.time} />
        <View style={s.center} pointerEvents="none">
          <LogoCanvas size={Math.min(width * 0.56, 260)} t={t} tx={touch.tx} ty={touch.ty} />
          <Wordmark word={t.word} tag={t.tag} />
        </View>
        <TouchLayer w={width} h={height} touch={touch} />
      </Animated.View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  root: { backgroundColor: "#03102B", zIndex: 100 },
  center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
});
