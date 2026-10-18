import { useEffect, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

// Two pages side by side inside ONE sheet: switching `page` slides the strip (no second modal, no timers). Both pages stay
// mounted so typed text and the selection survive; the hidden one is skipped by touch and by screen readers.
export function SheetPages({ page, children }: { page: 0 | 1; children: [ReactNode, ReactNode] }) {
  const { width } = useWindowDimensions();
  const calm = useReducedMotion();
  const at = useSharedValue<number>(page);
  useEffect(() => {
    at.value = calm ? page : withTiming(page, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [page, calm, at]);
  const strip = useAnimatedStyle(() => ({ transform: [{ translateX: -at.value * width }] }));
  return (
    <View style={s.clip}>
      <Animated.View style={[s.strip, { width: width * 2 }, strip]}>
        {children.map((child, i) => (
          <View key={i} style={{ width }} pointerEvents={i === page ? "auto" : "none"} accessibilityElementsHidden={i !== page} importantForAccessibility={i === page ? "auto" : "no-hide-descendants"}>
            {child}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({ clip: { flex: 1, overflow: "hidden" }, strip: { flex: 1, flexDirection: "row" } });
