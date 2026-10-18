import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useUrgentLabels, type UrgentFile, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { mmss } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { Card } from "./Card";

// What the client asked, in words that are easy to read, with the practice areas and the files / voice notes attached.
export function RequestCard({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  const c = useColors();
  const label = useUrgentLabels();
  const [file, setFile] = useState<UrgentFile | null>(null);
  return (
    <Card icon="message-square" title={t("ugx.request")}>
      <Text variant="body" style={s.need} selectable>{req.need || t("ug7.noNeed")}</Text>
      {req.directions.length ? <View style={s.chips}>{req.directions.map((d, i) => <Pill key={`${d}-${i}`} tone="cy" label={label.dir(d)} />)}</View> : null}
      {req.files.map((f, i) => (
        <PressableScale key={`${f.url}-${i}`} onPress={() => f.url && setFile(f)} accessibilityRole="button" accessibilityLabel={f.name} style={[s.file, { backgroundColor: c.surface2 }]}>
          <Icon name={f.voice ? "mic" : "file-text"} size={18} tone="accent" />
          <Text variant="small" weight="semibold" numberOfLines={1} style={s.flex}>{f.voice ? t("ugx.voice") : f.name}</Text>
          {f.voice && f.seconds ? <Text variant="caption" tone="gray">{mmss(f.seconds * 1000)}</Text> : null}
        </PressableScale>
      ))}
      <FilePreview visible={!!file} onClose={() => setFile(null)} file={file ? { path: file.url, name: file.name, mime: file.contentType || undefined } : null} />
    </Card>
  );
}

const s = StyleSheet.create({
  need: { lineHeight: 24 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  file: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 12, borderRadius: 14 },
  flex: { flex: 1 },
});
