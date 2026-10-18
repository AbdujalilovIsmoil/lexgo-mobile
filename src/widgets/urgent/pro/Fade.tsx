import type { ReactNode } from "react";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

// Eases a block in by opacity only, staggered by `i` — never a slide, so nothing sits a few pixels off its place.
export function Fade({ i = 0, children }: { i?: number; children: ReactNode }) {
  const calm = useReducedMotion();
  return <Animated.View entering={calm ? undefined : FadeIn.delay(40 + Math.min(i, 6) * 45).duration(300)}>{children}</Animated.View>;
}
