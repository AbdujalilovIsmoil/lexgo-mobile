import { useState, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";

const DURATION = 260;
const SHIFT = 120;

const slideIn = (dir: number) => new Keyframe({
  0: { opacity: 0.2, transform: [{ translateX: dir * SHIFT }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: Easing.out(Easing.cubic) },
}).duration(DURATION);

// The body under a tab switch: when `value` changes, the new content slides in from the side of the picked tab (right for a later one, left
// for an earlier one) with a short fade, like the end of a swipe. The first render is still. `order` lists the tab values left to right.
export function SlideSwap({ value, order, children, style }: { value: string; order: readonly string[]; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [state, setState] = useState({ value, dir: 1, moved: false });
  if (state.value !== value) setState({ value, dir: order.indexOf(value) >= order.indexOf(state.value) ? 1 : -1, moved: true });
  return (
    <Animated.View key={value} entering={state.moved ? slideIn(state.dir) : undefined} style={style}>
      {children}
    </Animated.View>
  );
}
