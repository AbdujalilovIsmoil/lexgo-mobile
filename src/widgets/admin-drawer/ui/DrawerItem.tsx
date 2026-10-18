import { StyleSheet, View } from "react-native";
import type { AdminModule } from "@/entities/access";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// One module in the switcher: tinted icon, title, one-line description; the open module is highlighted.
export function DrawerItem({ mod, active, onPress }: { mod: AdminModule; active: boolean; onPress: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <PressableScale onPress={onPress} scale={0.985} style={[s.row, { backgroundColor: active ? c.tint2 : "transparent" }]} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <View style={[s.icon, { backgroundColor: `${mod.color}22` }]}><Icon name={mod.icon} size={18} color={mod.color} /></View>
      <View style={s.col}>
        <Text variant="small" weight={active ? "bold" : "semibold"} numberOfLines={1}>{t(`admHub.mod.${mod.key}.title`)}</Text>
        <Text variant="caption" tone="gray2" numberOfLines={1}>{t(`admHub.mod.${mod.key}.desc`)}</Text>
      </View>
      {active ? <View style={[s.dot, { backgroundColor: c.accent }]} /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, paddingHorizontal: 10, borderRadius: radius.r },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
