import type { ReactNode } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

// Cheap staggered entrance for list rows (the first eight only get a delay).
export function Enter({ index = 0, children }: { index?: number; children: ReactNode }) {
  return <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 40).duration(260)}>{children}</Animated.View>;
}
