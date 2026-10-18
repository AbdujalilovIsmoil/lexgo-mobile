import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { GeneratedDoc } from "../model/types";

type Props = { doc: GeneratedDoc; busy: boolean; onView: () => void; onShare: () => void };

// The finished document: id for support / "Mening hujjatlarim", view and share/download.
export function GeneratedCard({ doc, busy, onView, onShare }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <Card tinted style={s.card}>
      <View style={[s.badge, { backgroundColor: c.okBg }]}><Icon name="check-circle" size={30} color={c.ok} /></View>
      <Text variant="h3" center>{t("dc4.ready")}</Text>
      {doc.title ? <Text variant="body" center>{doc.title}</Text> : null}
      <View style={s.pills}>
        {doc.workId ? <Pill label={doc.workId} tone="blue" icon="hash" /> : null}
        {doc.file?.format ? <Pill label={doc.file.format.toUpperCase()} tone="gray" icon="file-text" /> : null}
        <Pill label={doc.price ? t("dc4.paid") : t("dc4.free")} tone="ok" />
      </View>
      {doc.file ? (
        <View style={s.actions}>
          <Button title={t("dc4.view")} icon="eye" variant="gradient" onPress={onView} full />
          <Button title={t("dc4.share")} icon="share" variant="soft" onPress={onShare} loading={busy} full />
        </View>
      ) : (
        <Text variant="small" tone="gray" center>{t("dc4.noFile")}</Text>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { alignItems: "center", gap: 10 },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  actions: { gap: 10, alignSelf: "stretch", marginTop: 6 },
});
