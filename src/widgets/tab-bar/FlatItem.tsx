import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TabBadge } from "./TabBadge";
import type { TabDef } from "./tabConfig";

// One destination: the outline icon, the caption under it (bold when active) and the small accent dot that marks the active one.
export function FlatItem({ def, focused, onPress }: { def: TabDef; focused: boolean; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  const tint = focused ? c.ink : c.gray;
  return (
    <PressableScale onPress={onPress} haptic={false} scale={0.94} style={s.item} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <View collapsable={false} style={s.icon}>
        <Icon name={def.icon} size={25} color={tint} />
        <TabBadge id={def.badge} />
      </View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} numberOfLines={1} maxFontSizeMultiplier={1.1} style={[s.label, { color: tint }]}>
        {t(def.labelKey)}
      </Text>
      <View style={[s.dot, { backgroundColor: focused ? c.accent : "transparent" }]} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", gap: 4, minHeight: 56 },
  icon: { height: 28, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 13, lineHeight: 16 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
