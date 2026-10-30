import { StyleSheet, View } from "react-native";
import { useAiTheme } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// One short line under the AI input: personal data is masked before any external AI call (web .aichat__pii), and AI can be wrong.
export function PiiNote() {
  const { t } = useT();
  const aiTheme = useAiTheme();
  return (
    <View style={s.row} accessibilityLabel={t("cxAi.piiNote")}>
      <Icon name="lock" size={11} color={aiTheme.muted} />
      <Text variant="caption" numberOfLines={1} style={[s.note, { color: aiTheme.muted }]}>{t("cxAi.piiShort")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingTop: 8 },
  note: { fontSize: 11, lineHeight: 14 },
});
