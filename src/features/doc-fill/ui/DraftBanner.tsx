import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { timeAgo } from "@/shared/lib/format";

type Props = { at: number; onClear: () => void; onHide: () => void };

// Shown once when an earlier draft of this document was restored.
export function DraftBanner({ at, onClear, onHide }: Props) {
  const { t } = useT();
  return (
    <Card tinted style={s.card}>
      <Text variant="small" weight="semibold">{t("dc2.draftRestored")}</Text>
      <Text variant="caption" tone="gray">{timeAgo(new Date(at).toISOString(), t) || t("dc2.draftNow")}</Text>
      <View style={s.row}>
        <Button title={t("dc2.draftClear")} size="sm" variant="soft" onPress={onClear} />
        <Button title={t("dc2.draftKeep")} size="sm" variant="ghost" onPress={onHide} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 6, padding: 14 }, row: { flexDirection: "row", gap: 8, marginTop: 4 } });
