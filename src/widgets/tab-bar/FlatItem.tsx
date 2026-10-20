import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TabBadge } from "./TabBadge";
import type { TabDef } from "./tabConfig";

// Material 3 navigation destination: a 64×32 pill (the secondary container) behind the icon when active, the label under it.
export function FlatItem({ def, focused, onPress }: { def: TabDef; focused: boolean; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  return (
    <PressableScale onPress={onPress} haptic={false} scale={0.94} style={s.item} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <View collapsable={false} style={[s.pill, { backgroundColor: focused ? c.tint2 : "transparent" }]}>
        <Icon name={def.icon} size={24} color={focused ? c.accentStrong : c.gray} />
        <TabBadge id={def.badge} />
      </View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} numberOfLines={1} style={{ color: focused ? c.ink : c.gray, fontSize: 12 }}>
        {t(def.labelKey)}
      </Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", gap: 4, minHeight: 56 },
  pill: { width: 64, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
