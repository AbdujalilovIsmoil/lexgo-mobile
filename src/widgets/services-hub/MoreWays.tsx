import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { CatalogActions } from "@/widgets/services-catalog";

// Under the list: the other ways to get help — the AI intake and the urgent advocate (two cards), and an advocate writing a
// document from scratch. They rise in when the list has finished appearing.
export function MoreWays({ onNewDoc }: { onNewDoc: () => void }) {
  const { t } = useT();
  return (
    <Animated.View entering={FadeInUp.delay(300).duration(360)} style={s.col}>
      <Text variant="h4">{t("svh.otherWays")}</Text>
      <CatalogActions />
      <NewDocOrder onNewDoc={onNewDoc} />
    </Animated.View>
  );
}

// "Order a document written from scratch": the dashed row that closes the page (the catalogue puts the two cards above it on top instead).
export function NewDocOrder({ onNewDoc }: { onNewDoc: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <PressableScale onPress={onNewDoc} scale={0.98} accessibilityRole="button" style={[s.new, { borderColor: c.accent, backgroundColor: c.tint }]}>
      <View style={[s.plus, { backgroundColor: c.accent }]}><Icon name="plus" size={18} tone="white" /></View>
      <Text variant="small" weight="bold" tone="accent" style={s.flex}>{t("csv.newDocOrder")}</Text>
      <Icon name="arrow-right" size={16} tone="accent" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  col: { gap: 12, marginTop: 6 },
  flex: { flex: 1 },
  new: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: radius.rl, borderWidth: 1.5, borderStyle: "dashed" },
  plus: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
