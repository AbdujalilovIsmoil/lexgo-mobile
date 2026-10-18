import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const SPRING = { damping: 24, stiffness: 240, mass: 0.9 };

// Slide-in motion of the left panel on the UI thread: `x` runs from -width (hidden) to 0 (open).
// Dragging the panel to the left (or flicking) closes it.
export function useDrawerMotion(width: number, onClosed: () => void) {
  const x = useSharedValue(-width);
  const start = useSharedValue(0);
  const open = () => {
    x.value = withSpring(0, SPRING);
  };
  const close = () => {
    x.value = withTiming(-width, { duration: 200 }, (done) => {
      if (done) scheduleOnRN(onClosed);
    });
  };
  const gesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-24, 24])
    .onBegin(() => {
      start.value = x.value;
    })
    .onUpdate((e) => {
      x.value = Math.min(0, Math.max(-width, start.value + e.translationX));
    })
    .onEnd((e) => {
      if (x.value + e.velocityX * 0.12 < -width * 0.4) {
        x.value = withTiming(-width, { duration: 180 }, (done) => {
          if (done) scheduleOnRN(onClosed);
        });
      } else x.value = withSpring(0, SPRING);
    });
  return { x, gesture, open, close };
}
