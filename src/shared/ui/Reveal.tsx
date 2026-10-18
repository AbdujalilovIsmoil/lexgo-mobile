import type { ReactNode } from "react";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

// A block that eases in from below; `i` staggers siblings (45 ms apart, capped so a long page never waits).
export function Reveal({ i = 0, children }: { i?: number; children: ReactNode }) {
  const calm = useReducedMotion();
  return <Animated.View entering={calm ? undefined : FadeInDown.delay(Math.min(i, 6) * 45).duration(320)}>{children}</Animated.View>;
}
