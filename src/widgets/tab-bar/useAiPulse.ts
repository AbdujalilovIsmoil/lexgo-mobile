import { useEffect } from "react";
import { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const BEAT_MS = 2600; // one beat: the sparkle swells and turns a little, a soft ring breathes out of the disc
const BEATS = 5; // ~13 s each time the button comes into view, then it rests (no endless loop: it would hold the display at 120 Hz)
const TURNS = 6; // the light round the disc goes round this many times over the same ~13 s, slowing to a stop

// The AI button's motion, shared by the Android bar and the iOS raised button. `on` = the button is on view and the app in front;
// a new `replay` value (the tab that is open) plays it again.
export function useAiPulse(on: boolean, replay?: string) {
  const calm = useReducedMotion();
  const t = useSharedValue(0);
  const turn = useSharedValue(0);
  useEffect(() => {
    if (!on || calm) return;
    t.set(0);
    t.set(withRepeat(withSequence(withDelay(300, withTiming(1, { duration: BEAT_MS - 700, easing: Easing.out(Easing.cubic) })), withTiming(0, { duration: 400 })), BEATS, false));
    turn.set(turn.get() % 1);
    turn.set(withTiming(turn.get() + TURNS, { duration: BEAT_MS * BEATS, easing: Easing.out(Easing.quad) }));
    return () => { cancelAnimation(t); cancelAnimation(turn); };
  }, [on, calm, replay, t, turn]);
  const icon = useAnimatedStyle(() => {
    const k = Math.sin(Math.PI * Math.min(t.get() * 1.6, 1)); // up and back down in the first part of the beat
    return { transform: [{ scale: 1 + k * 0.2 }, { rotate: `${k * 18}deg` }] };
  });
  const ring = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - t.get()) * (t.get() > 0 ? 1 : 0), transform: [{ scale: 1 + t.get() * 0.6 }] }));
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 360}deg` }] }));
  return { icon, ring, spin };
}
