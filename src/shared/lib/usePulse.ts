import { useEffect } from "react";
import { cancelAnimation, Easing, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

/** 0→1 once per `ms`, forever (a sweep); `blink` makes it 0→1→0 instead (a heartbeat). Runs on the UI thread. */
export function usePulse(ms: number, blink = false) {
  const p = useSharedValue(0);
  const calm = useReducedMotion();
  useEffect(() => {
    if (calm) {
      p.value = blink ? 1 : 0; // reduced motion: a still dot instead of a pulse
      return;
    }
    const up = withTiming(1, { duration: blink ? ms / 2 : ms, easing: blink ? Easing.inOut(Easing.quad) : Easing.out(Easing.quad) });
    p.value = withRepeat(blink ? withSequence(up, withTiming(0, { duration: ms / 2, easing: Easing.inOut(Easing.quad) })) : up, -1, false);
    return () => cancelAnimation(p);
  }, [p, ms, blink, calm]);
  return p;
}
