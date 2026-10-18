import { StyleSheet } from "react-native";
import { aiTheme } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "Maxfiylik: …" — personal data is masked before any external AI call (web .aichat__pii), shown above the composer.
export function PiiNote() {
  const { t } = useT();
  return <Text variant="caption" center style={s.note}>{t("cxAi.piiNote")}</Text>;
}

const s = StyleSheet.create({ note: { color: aiTheme.muted, fontSize: 10.5, lineHeight: 14, paddingHorizontal: 16, paddingTop: 6 } });
