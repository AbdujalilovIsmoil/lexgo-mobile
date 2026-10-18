import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const SPRING = { damping: 21, stiffness: 220, mass: 0.9 };

// Height-driven sheet motion on the UI thread. The sheet is `h` px tall: it
// opens to the first snap, can be dragged between snaps (resize) and closes
// when pulled low enough or flicked down.
export function useSheetMotion(snaps: number[], onClosed: () => void) {
  const h = useSharedValue(0);
  const start = useSharedValue(0);
  const top = snaps[snaps.length - 1];
  const low = snaps[0];

  const open = () => {
    h.value = withSpring(low, SPRING);
  };
  const close = () => {
    h.value = withTiming(0, { duration: 220 }, (done) => {
      if (done) scheduleOnRN(onClosed);
    });
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      start.value = h.value;
    })
    .onUpdate((e) => {
      h.value = Math.min(top, Math.max(0, start.value - e.translationY));
    })
    .onEnd((e) => {
      const projected = h.value - e.velocityY * 0.12;
      if (projected < low * 0.6) {
        h.value = withTiming(0, { duration: 200 }, (done) => {
          if (done) scheduleOnRN(onClosed);
        });
        return;
      }
      let best = snaps[0];
      for (let i = 1; i < snaps.length; i++) if (Math.abs(snaps[i] - projected) < Math.abs(best - projected)) best = snaps[i];
      h.value = withSpring(best, SPRING);
    });

  return { h, gesture, open, close };
}
