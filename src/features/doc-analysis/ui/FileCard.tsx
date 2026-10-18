import { StyleSheet, View } from "react-native";
import type { PickedDoc } from "@/entities/doc-analysis";
import { Card, Icon, IconButton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// The chosen file with a remove button.
export function FileCard({ file, onRemove }: { file: PickedDoc; onRemove: () => void }) {
  const { t } = useT();
  return (
    <Card style={s.card}>
      <Icon name="file-text" size={26} tone="accent" />
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={1}>{file.name}</Text>
        <Text variant="caption" tone="gray">{kb(file.size)}</Text>
      </View>
      <IconButton icon="x" size={36} onPress={onRemove} label={t("docs.remove")} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  col: { flex: 1, gap: 2 },
});
