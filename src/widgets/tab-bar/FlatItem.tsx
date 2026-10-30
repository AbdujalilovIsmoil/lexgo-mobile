import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TabBadge } from "./TabBadge";
import type { TabDef } from "./tabConfig";

const BOUNCE = { damping: 9, stiffness: 260, mass: 0.6 };

// One destination: the outline icon, the caption under it (bold when active) and the small accent dot that marks the active one.
// Becoming active, the icon hops up and settles and the dot pops in.
export function FlatItem({ def, focused, onPress }: { def: TabDef; focused: boolean; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  const calm = useReducedMotion();
  const tint = focused ? c.ink : c.gray;
  const lift = useSharedValue(0);
  const dot = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    if (calm) { dot.set(focused ? 1 : 0); return; }
    if (focused) lift.set(withSequence(withTiming(-7, { duration: 130 }), withSpring(0, BOUNCE)));
    dot.set(focused ? withSpring(1, BOUNCE) : withTiming(0, { duration: 120 }));
  }, [focused, calm, lift, dot]);
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: lift.get() }] }));
  const mark = useAnimatedStyle(() => ({ opacity: dot.get(), transform: [{ scale: dot.get() }] }));
  return (
    <PressableScale onPress={onPress} haptic={false} scale={0.94} style={s.item} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <Animated.View collapsable={false} style={[s.icon, icon]}>
        <Icon name={def.icon} size={25} color={tint} />
        <TabBadge id={def.badge} />
      </Animated.View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} numberOfLines={1} maxFontSizeMultiplier={1.1} style={[s.label, { color: tint }]}>
        {t(def.labelKey)}
      </Text>
      <Animated.View style={[s.dot, { backgroundColor: c.accent }, mark]} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", gap: 4, minHeight: 56 },
  icon: { height: 28, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 13, lineHeight: 16 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
