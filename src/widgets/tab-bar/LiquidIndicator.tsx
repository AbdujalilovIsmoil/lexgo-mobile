import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from "react-native-reanimated";
import { useTheme } from "@/shared/theme";
import { loadGlass } from "@/shared/lib/glass";

type Props = { index: number; slot: number; hidden: boolean; left: number; lift: SharedValue<number> };

const GLASS = loadGlass();

// The lens of the selected tab, like iOS 26's: a piece of glass that lives in the same glass container as the bar (so the two blend into
// one liquid surface), slides to the tab you pick with a soft spring, swells while a finger is on the bar and, while it travels,
// stretches a little along the way it goes and flattens, then settles. Without iOS 26 glass it is a soft tinted pill.
export function LiquidIndicator({ index, slot, hidden, left, lift }: Props) {
  const { dark } = useTheme();
  const x = useSharedValue(index * slot);
  const goal = useSharedValue(index * slot);
  const show = useSharedValue(hidden ? 0 : 1);
  useEffect(() => {
    goal.value = index * slot;
    x.value = withSpring(index * slot, { damping: 17, stiffness: 210, mass: 0.85 });
    show.value = withSpring(hidden ? 0 : 1, { damping: 18, stiffness: 240 });
  }, [index, slot, hidden, x, goal, show]);
  const style = useAnimatedStyle(() => {
    const travel = Math.min(Math.abs(goal.value - x.value) / Math.max(slot, 1), 1);
    const grow = 1 + 0.1 * lift.value;
    return { opacity: show.value, transform: [{ translateX: x.value }, { scaleX: (1 + travel * 0.32) * grow * (0.9 + 0.1 * show.value) }, { scaleY: (1 - travel * 0.1) * grow }] };
  });
  const width = Math.max(slot - 4, 0);
  if (GLASS) {
    return (
      <Animated.View pointerEvents="none" style={[s.drop, { width, left }, style]}>
        <GLASS.View glassEffectStyle="regular" isInteractive colorScheme={dark ? "dark" : "light"} tintColor={dark ? "rgba(255,255,255,0.12)" : "rgba(22,104,240,0.12)"} style={[StyleSheet.absoluteFill, s.round]} />
      </Animated.View>
    );
  }
  return <Animated.View pointerEvents="none" style={[s.drop, s.flat, { width, left, backgroundColor: dark ? "rgba(255,255,255,0.16)" : "rgba(22,104,240,0.12)", borderColor: dark ? "rgba(255,255,255,0.22)" : "rgba(22,104,240,0.18)" }, style]} />;
}

const s = StyleSheet.create({
  drop: { position: "absolute", top: 8, height: 54, borderRadius: 27, overflow: "hidden" },
  flat: { borderWidth: 1 },
  round: { borderRadius: 27 },
});
