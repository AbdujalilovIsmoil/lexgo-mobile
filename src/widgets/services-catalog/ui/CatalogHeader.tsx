import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { title: string; count?: string; onNewDoc: () => void };

// Title of the current screen with how much is on it, then one wide card for the way out of the catalogue
// (an advocate writes the document from scratch, or checks one the client already has).
export function CatalogHeader({ title, count, onNewDoc }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      <View style={s.head}>
        <Text variant="h3" numberOfLines={2} style={s.flex}>{title}</Text>
        {count ? <View style={[s.count, { backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" tone="accent">{count}</Text></View> : null}
      </View>
      <PressableScale onPress={onNewDoc} scale={0.98} accessibilityRole="button" style={[s.new, { borderColor: c.accent, backgroundColor: c.tint }]}>
        <View style={[s.plus, { backgroundColor: c.accent }]}><Icon name="plus" size={18} tone="white" /></View>
        <Text variant="small" weight="bold" tone="accent" style={s.flex}>{t("csv.newDocOrder")}</Text>
        <Icon name="arrow-right" size={16} tone="accent" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  count: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  new: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: radius.rl, borderWidth: 1.5, borderStyle: "dashed" },
  plus: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
