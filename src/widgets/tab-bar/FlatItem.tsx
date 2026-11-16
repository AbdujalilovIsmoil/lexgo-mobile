import { Pressable, StyleSheet, View } from "react-native";
import { brand, mainColor, useTheme } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TabBadge } from "./TabBadge";
import { TabIcon } from "./tabIcons";
import type { TabDef } from "./tabConfig";

// One destination (Adliya): the outline icon, the caption under it. The active one's icon is white on a navy rounded square and its caption
// navy and bold. A press switches at once, with no press effect (no scale, dim, hop or haptic).
export function FlatItem({ def, focused, onPress }: { def: TabDef; focused: boolean; onPress: () => void }) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const tint = focused ? c.accentStrong : c.gray;
  return (
    <Pressable onPress={onPress} style={s.item} accessibilityRole="button" accessibilityState={{ selected: focused }} accessibilityLabel={t(def.labelKey)}>
      <View collapsable={false} style={s.icon}>
        {focused ? <View pointerEvents="none" style={[s.square, { backgroundColor: dark || glass ? brand.b600 : mainColor }]} /> : null}
        <TabIcon name={def.icon} color={focused ? "#FFFFFF" : c.gray} size={focused ? 21 : 24} />
        <TabBadge id={def.badge} />
      </View>
      <Text variant="caption" weight={focused ? "bold" : "medium"} numberOfLines={1} maxFontSizeMultiplier={1.1} style={[s.label, { color: tint }]}>
        {t(def.labelKey)}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", gap: 4, minHeight: 56 },
  icon: { height: 28, minWidth: 34, alignItems: "center", justifyContent: "center" },
  square: { position: "absolute", width: 34, height: 34, borderRadius: 10, top: -3 },
  label: { fontSize: 13, lineHeight: 16 },
});
