import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withDecay, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { MAX_ZOOM, MIN_ZOOM, bound, clamp } from "./chartMath";

export { MIN_ZOOM, MAX_ZOOM } from "./chartMath";

// Pan (one finger), pinch (two fingers, around the fingers), double-tap = fit. The content box (cw x ch) is scaled
// around its own centre, so a content point p sits at (cw/2 + tx) + (p - cw/2) * s inside the viewport.
export function useChartGestures(cw: number, ch: number, vw: number, vh: number) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const s = useSharedValue(1);
  const a = { tx: useSharedValue(0), ty: useSharedValue(0), s: useSharedValue(1), px: useSharedValue(0), py: useSharedValue(0) };

  const fitTo = () => {
    const k = clamp(Math.min((vw - 32) / cw, (vh - 32) / ch), MIN_ZOOM, 1);
    s.value = withTiming(k, { duration: 220 });
    tx.value = withTiming((vw - cw * k) / 2 - (cw * (1 - k)) / 2, { duration: 220 });
    ty.value = withTiming(16 - (ch * (1 - k)) / 2, { duration: 220 });
  };
  // Zoom about the viewport centre (the +/- buttons).
  const zoomBy = (f: number) => {
    const k = clamp(s.value * f, MIN_ZOOM, MAX_ZOOM);
    const px = (vw / 2 - (cw / 2 + tx.value)) / s.value + cw / 2;
    const py = (vh / 2 - (ch / 2 + ty.value)) / s.value + ch / 2;
    s.value = withTiming(k, { duration: 160 });
    tx.value = withTiming(vw / 2 - (px - cw / 2) * k - cw / 2, { duration: 160 });
    ty.value = withTiming(vh / 2 - (py - ch / 2) * k - ch / 2, { duration: 160 });
  };

  const pan = Gesture.Pan().maxPointers(1).onBegin(() => {
    a.tx.value = tx.value;
    a.ty.value = ty.value;
  }).onUpdate((e) => {
    const bx = bound(cw, vw, s.value);
    const by = bound(ch, vh, s.value);
    tx.value = clamp(a.tx.value + e.translationX, bx.lo, bx.hi);
    ty.value = clamp(a.ty.value + e.translationY, by.lo, by.hi);
  }).onEnd((e) => {
    // Let go with momentum; the decay stops at the same bounds the drag respects.
    const bx = bound(cw, vw, s.value);
    const by = bound(ch, vh, s.value);
    tx.value = withDecay({ velocity: e.velocityX, clamp: [bx.lo, bx.hi], deceleration: 0.996 });
    ty.value = withDecay({ velocity: e.velocityY, clamp: [by.lo, by.hi], deceleration: 0.996 });
  });
  const pinch = Gesture.Pinch().onBegin((e) => {
    a.s.value = s.value;
    a.px.value = (e.focalX - (cw / 2 + tx.value)) / s.value + cw / 2;
    a.py.value = (e.focalY - (ch / 2 + ty.value)) / s.value + ch / 2;
  }).onUpdate((e) => {
    const k = clamp(a.s.value * e.scale, MIN_ZOOM, MAX_ZOOM);
    s.value = k;
    tx.value = e.focalX - (a.px.value - cw / 2) * k - cw / 2;
    ty.value = e.focalY - (a.py.value - ch / 2) * k - ch / 2;
  });
  const tap = Gesture.Tap().numberOfTaps(2).onEnd(() => scheduleOnRN(fitTo));
  const gesture = Gesture.Simultaneous(pan, pinch, tap);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: s.value }] }));
  return { gesture, style, zoomBy, fitTo, scale: s };
}
