import type { ReactNode } from "react";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

// Eases a block in by opacity only, staggered by `i`. No movement: a block that is still "on its way" (an interrupted slide) can sit a few
// pixels off and press against its neighbour, so the seller home's tiles and panels only fade — they are always where the layout puts them.
export function Fade({ i = 0, children }: { i?: number; children: ReactNode }) {
  const calm = useReducedMotion();
  return <Animated.View entering={calm ? undefined : FadeIn.delay(40 + Math.min(i, 6) * 45).duration(300)}>{children}</Animated.View>;
}
