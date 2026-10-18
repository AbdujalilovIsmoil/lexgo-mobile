import { Gesture } from "react-native-gesture-handler";
import { Easing, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { tapHaptic } from "@/shared/lib/haptics";

const clamp = (v: number) => {
  "worklet";
  return Math.max(-1, Math.min(1, v));
};

function useRipple() {
  return { x: useSharedValue(0), y: useSharedValue(0), p: useSharedValue(1) };
}

// Touch layer of the splash: drag tilts the logo and moves a light under the
// finger, a tap sends a ripple, a fast swipe up skips the splash.
export function useSplashTouch(leave: () => void) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const active = useSharedValue(0);
  const slot = useSharedValue(0);
  const ripples = [useRipple(), useRipple(), useRipple()];

  const tap = Gesture.Tap().onEnd((e) => {
    const r = ripples[slot.value % 3];
    slot.value += 1;
    r.x.value = e.x;
    r.y.value = e.y;
    r.p.value = 0;
    r.p.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
    scheduleOnRN(tapHaptic);
  });

  const pan = Gesture.Pan()
    .minDistance(4)
    .onBegin((e) => {
      px.value = e.x;
      py.value = e.y;
      active.value = withTiming(1, { duration: 160 });
    })
    .onUpdate((e) => {
      px.value = e.x;
      py.value = e.y;
      tx.value = clamp(e.translationX / 150);
      ty.value = clamp(e.translationY / 150);
    })
    .onEnd((e) => {
      if (e.velocityY < -900) scheduleOnRN(leave);
    })
    .onFinalize(() => {
      active.value = withTiming(0, { duration: 300 });
      tx.value = withSpring(0, { damping: 12 });
      ty.value = withSpring(0, { damping: 12 });
    });

  return { gesture: Gesture.Simultaneous(tap, pan), tx, ty, px, py, active, ripples };
}
