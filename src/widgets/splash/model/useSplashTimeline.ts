import { useCallback, useEffect, useRef, useState } from "react";
import { Easing, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSplash } from "@/shared/lib/splash";

const out = Easing.out(Easing.cubic);
const SHOW_MS = 3050; // the tagline is in: the intro has played
const QUICK_MS = 600; // opened by a link or a notification: just long enough not to flash

// One shared timeline (UI thread) that drives every layer of the splash:
// outline draw → fill → pop → shine sweep → wordmark → tagline → exit.
export function useSplashTimeline(onDone: () => void, ready: boolean) {
  const d0 = useSharedValue(0);
  const d1 = useSharedValue(0);
  const d2 = useSharedValue(0);
  const d3 = useSharedValue(0);
  const strokeOp = useSharedValue(1);
  const fill = useSharedValue(0);
  const shine = useSharedValue(-320);
  const pop = useSharedValue(0.86);
  const word = useSharedValue(0);
  const tag = useSharedValue(0);
  const bg = useSharedValue(0);
  const time = useSharedValue(0);
  const exit = useSharedValue(0);
  const left = useRef(false);
  const [elapsed, setElapsed] = useState(false);
  const [brief, setBrief] = useState(false);
  const quick = useSplash((s) => s.quick);

  const leave = useCallback(() => {
    if (left.current) return;
    left.current = true;
    // eslint-disable-next-line react-hooks/immutability
    exit.value = withTiming(1, { duration: 450 });
    setTimeout(onDone, 470);
  }, [exit, onDone]);

  useEffect(() => {
    const draw = (v: typeof d0, delay: number) => (v.value = withDelay(delay, withTiming(1, { duration: 1000, easing: out })));
    bg.value = withTiming(1, { duration: 600 });
    draw(d0, 150);
    draw(d1, 330);
    draw(d2, 510);
    draw(d3, 690);
    fill.value = withDelay(1050, withTiming(1, { duration: 700 }));
    strokeOp.value = withDelay(1500, withTiming(0, { duration: 600 }));
    pop.value = withDelay(1050, withSpring(1, { damping: 11, stiffness: 110 }));
    shine.value = withDelay(1700, withTiming(1500, { duration: 1100, easing: Easing.inOut(Easing.quad) }));
    word.value = withDelay(1650, withTiming(1, { duration: 1000, easing: out }));
    tag.value = withDelay(2250, withTiming(1, { duration: 800 }));
    time.value = withRepeat(withSequence(withTiming(1, { duration: 16000, easing: Easing.linear })), -1, false);
    const id = setTimeout(() => setElapsed(true), SHOW_MS);
    const short = setTimeout(() => setBrief(true), QUICK_MS);
    return () => { clearTimeout(id); clearTimeout(short); };
  }, [bg, d0, d1, d2, d3, fill, pop, shine, strokeOp, tag, time, word]);

  // Never reveal a half-loaded app: wait for both the animation (or its short form) and readiness.
  useEffect(() => {
    if (ready && (elapsed || (quick && brief))) leave();
  }, [elapsed, brief, quick, ready, leave]);

  return { draws: [d0, d1, d2, d3], strokeOp, fill, shine, pop, word, tag, bg, time, exit, leave };
}
