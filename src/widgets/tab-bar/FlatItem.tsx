import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TabBadge } from "./TabBadge";
import type { TabDef } from "./tabConfig";

// Original tab: icon over a label, brand blue when active.
export function FlatItem({ def, focused, onPress }: { def: TabDef; focused: boolean; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  const tone = focused ? c.accent : c.gray2;
  return (
    <PressableScale onPress={onPress} haptic={false} scale={0.92} style={s.item} accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <View>
        <Icon name={def.icon} size={22} color={tone} />
        <TabBadge id={def.badge} />
      </View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} style={{ color: tone, fontSize: 10.5 }}>
        {t(def.labelKey)}
      </Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 4, minHeight: 48 },
});
