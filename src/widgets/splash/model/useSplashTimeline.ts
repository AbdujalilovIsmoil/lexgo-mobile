import { useCallback, useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { Easing, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useSplash } from "@/shared/lib/splash";

const INTRO_MS = 2000; // the name is in and has been read
const QUICK_MS = 450; // opened by a link or a notification: just long enough not to flash
const EXIT_MS = 520; // the zoom into the screen

// Yandex-style intro: the mark is already on screen (the native splash shows the same mark at
// the same spot), the name rises in under it, and after ~2 s the mark rushes towards the viewer
// (a buzz on the way) while the app is revealed underneath.
export function useSplashTimeline(onDone: () => void, ready: boolean, fontsReady: boolean) {
  const word = useSharedValue(0); // 0 → 1: the name rises in under the mark
  const exit = useSharedValue(0); // 0 → 1: zoom out of the screen
  const left = useRef(false);
  const [elapsed, setElapsed] = useState(false);
  const [brief, setBrief] = useState(false);
  const quick = useSplash((s) => s.quick);
  const reduceMotion = useReducedMotion();

  const leave = useCallback(() => {
    if (left.current) return;
    left.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // eslint-disable-next-line react-hooks/immutability
    exit.value = withTiming(1, { duration: reduceMotion ? 250 : EXIT_MS, easing: Easing.in(Easing.cubic) });
    setTimeout(onDone, (reduceMotion ? 250 : EXIT_MS) + 20);
  }, [exit, onDone, reduceMotion]);

  useEffect(() => {
    const id = setTimeout(() => setElapsed(true), INTRO_MS);
    const short = setTimeout(() => setBrief(true), QUICK_MS);
    return () => { clearTimeout(id); clearTimeout(short); };
  }, []);

  // The name waits for its font, so it never flashes in the system font first.
  useEffect(() => {
    if (fontsReady) word.value = withDelay(reduceMotion ? 0 : 250, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [fontsReady, word, reduceMotion]);

  // Never reveal a half-loaded app: wait for both the intro (or its short form) and readiness.
  useEffect(() => {
    if (ready && (elapsed || (quick && brief))) leave();
  }, [elapsed, brief, quick, ready, leave]);

  return { word, exit, reduceMotion };
}
