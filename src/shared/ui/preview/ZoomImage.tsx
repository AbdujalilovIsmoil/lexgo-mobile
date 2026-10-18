import { Image, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type Props = { uri: string; width?: number; height?: number };

// Pinch to zoom, drag while zoomed, double-tap to toggle 2.5x.
export function ZoomImage({ uri, width, height }: Props) {
  const win = useWindowDimensions();
  const scale = useSharedValue(1);
  const base = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const w = width ?? win.width;
  const h = height ?? win.height * 0.8;
  const pinch = Gesture.Pinch()
    .onUpdate((e) => (scale.value = Math.max(1, Math.min(base.value * e.scale, 5))))
    .onEnd(() => {
      base.value = scale.value;
      if (scale.value <= 1) {
        x.value = withTiming(0);
        y.value = withTiming(0);
      }
    });
  const pan = Gesture.Pan()
    .minPointers(1)
    .onChange((e) => {
      if (scale.value > 1) {
        x.value += e.changeX;
        y.value += e.changeY;
      }
    });
  const tap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const next = scale.value > 1 ? 1 : 2.5;
      scale.value = withTiming(next);
      base.value = next;
      if (next === 1) {
        x.value = withTiming(0);
        y.value = withTiming(0);
      }
    });
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }] }));
  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, tap)}>
      <Animated.View style={[s.box, { width: w, height: h }, style]}>
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
      </Animated.View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({ box: { alignSelf: "center" } });
