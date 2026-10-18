import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Big dashed card: tap to choose a PDF / DOCX / TXT.
export function PickArea({ onPress }: { onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  return (
    <PressableScale onPress={onPress} scale={0.985} style={[s.box, { borderColor: c.accent, backgroundColor: c.tint }]} accessibilityRole="button">
      <View style={[s.icon, { backgroundColor: c.tint2 }]}><Icon name="upload-cloud" size={28} tone="accent" /></View>
      <Text variant="h4">{t("docs.pick")}</Text>
      <Text variant="caption" tone="gray">{t("docs.pickHint")}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  box: { alignItems: "center", gap: 6, paddingVertical: 28, borderRadius: 24, borderWidth: 2, borderStyle: "dashed" },
  icon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 4 },
});
