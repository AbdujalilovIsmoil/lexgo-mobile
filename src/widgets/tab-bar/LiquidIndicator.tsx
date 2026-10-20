import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "@/shared/theme";

type Props = { index: number; slot: number; hidden: boolean; left: number };

// The lens under the active tab: a soft tinted pill that slides to the tab
// you press — or follows your finger while you drag along the bar — and settles without any wobble.
export function LiquidIndicator({ index, slot, hidden, left }: Props) {
  const { dark } = useTheme();
  const x = useSharedValue(index * slot);
  const show = useSharedValue(hidden ? 0 : 1);
  useEffect(() => {
    x.value = withSpring(index * slot, { damping: 20, stiffness: 260, mass: 0.8 });
    show.value = withSpring(hidden ? 0 : 1, { damping: 18, stiffness: 240 });
  }, [index, slot, hidden, x, show]);
  const style = useAnimatedStyle(() => ({ opacity: show.value, transform: [{ translateX: x.value }, { scale: 0.9 + 0.1 * show.value }] }));
  const width = Math.max(slot - 4, 0);
  // Flat, not a second glass layer: glass over glass samples the bar under it and turns muddy.
  const fill = dark ? "rgba(255,255,255,0.16)" : "rgba(22,104,240,0.12)";
  const edge = dark ? "rgba(255,255,255,0.22)" : "rgba(22,104,240,0.18)";
  return <Animated.View pointerEvents="none" style={[s.drop, { width, left, backgroundColor: fill, borderColor: edge }, style]} />;
}

const s = StyleSheet.create({
  drop: { position: "absolute", top: 8, height: 54, borderRadius: 27, borderWidth: 1 },
});
