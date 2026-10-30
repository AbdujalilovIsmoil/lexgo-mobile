import { StyleSheet } from "react-native";
import { useAiTheme } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "Maxfiylik: …" — personal data is masked before any external AI call (web .aichat__pii), shown above the composer once there is a chat
// (the empty screen has the privacy chip instead).
export function PiiNote() {
  const { t } = useT();
  const aiTheme = useAiTheme();
  return <Text variant="caption" center style={[s.note, { color: aiTheme.muted }]}>{t("cxAi.piiNote")}</Text>;
}

const s = StyleSheet.create({ note: { fontSize: 10.5, lineHeight: 14, paddingHorizontal: 16, paddingTop: 6 } });
