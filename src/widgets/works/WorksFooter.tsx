import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { filling: boolean; failed: boolean; onRetry: () => void };

// Below the rows: the rest of the works are still loading, or loading them failed.
export function WorksFooter({ filling, failed, onRetry }: Props) {
  const c = useColors();
  const { t } = useT();
  if (failed) return <View style={s.row}><Text variant="small" tone="gray">{t("cl1.partial")}</Text><Button title={t("common.retry")} variant="soft" size="sm" onPress={onRetry} /></View>;
  if (!filling) return null;
  return <View style={s.row}><ActivityIndicator color={c.accent} /><Text variant="small" tone="gray">{t("cl1.loadingRest")}</Text></View>;
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
});
