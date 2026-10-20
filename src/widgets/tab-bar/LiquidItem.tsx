import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TabBadge } from "./TabBadge";
import type { TabDef } from "./tabConfig";

// One iOS tab: the icon lifts and pops when it becomes active.
export function LiquidItem({ def, focused, onPress }: { def: TabDef; focused: boolean; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  const lift = useSharedValue(focused ? 1 : 0);
  const pop = useSharedValue(1);
  useEffect(() => {
    lift.value = withTiming(focused ? 1 : 0, { duration: 220 });
    if (focused) pop.value = withSequence(withSpring(1.28, { damping: 6, stiffness: 320 }), withSpring(1, { damping: 8 }));
  }, [focused, lift, pop]);
  const icon = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { translateY: -1 * lift.value }] }));
  const tone = focused ? c.accent : c.ink; // the bar is glass over moving content: the quiet grey disappeared, so idle tabs use the ink colour
  return (
    <PressableScale onPress={onPress} haptic={false} scale={0.9} style={s.item} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <Animated.View style={[icon, !focused && { opacity: 0.78 }]}>
        <Icon name={def.icon} size={22} color={tone} />
        <TabBadge id={def.badge} />
      </Animated.View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[s.label, { color: tone }]}>
        {t(def.labelKey)}
      </Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", gap: 3, height: 54, paddingHorizontal: 6 },
  label: { fontSize: 10, lineHeight: 13, maxWidth: "100%", textAlign: "center", includeFontPadding: false },
});
