import { useState } from "react";
import { StyleSheet } from "react-native";
import type { MarketOrder, ResultFile } from "@/entities/order";
import { Card, ListRow, Text } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { useT } from "@/shared/i18n";

// The seller's result after completion: text and/or files, opened in the app's own viewer.
export function ResultCard({ order: o }: { order: MarketOrder }) {
  const { t } = useT();
  const [file, setFile] = useState<ResultFile | null>(null);
  if (!o.resultText && !o.resultFiles.length) return null;
  return (
    <Card style={s.card}>
      <Text variant="body" weight="bold">{t("ntd.od.result")}</Text>
      {o.resultText ? <Text variant="small">{o.resultText}</Text> : null}
      {o.resultFiles.map((f) => <ListRow key={f.path} icon="file-text" title={f.name} onPress={() => setFile(f)} />)}
      <FilePreview visible={!!file} onClose={() => setFile(null)} file={file ? { path: file.path, name: file.name } : null} />
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 8, padding: 14 } });
