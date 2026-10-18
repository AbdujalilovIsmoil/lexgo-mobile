import { StyleSheet, View } from "react-native";
import { Avatar, IconButton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { DocStatus, FlowBadge, type DocReq } from "@/entities/doc-queue";

// Top of the request sheet: who asked and when (monogram, name, date), the document's title, and status + flow pills.
export function DocSheetHead({ doc, onClose }: { doc: DocReq; onClose: () => void }) {
  const { t, locale } = useT();
  return (
    <View style={s.col}>
      <View style={s.row}>
        {doc.clientName ? <Avatar name={doc.clientName} size={44} /> : null}
        <View style={s.flex}>
          <Text variant="body" weight="bold" numberOfLines={1}>{doc.clientName || t("ad1.client")}</Text>
          {doc.createdAt ? <Text variant="caption" tone="gray" numberOfLines={1}>{t("proDocSheet.askedOn", { date: fmtDate(doc.createdAt, locale) })}</Text> : null}
        </View>
        <IconButton icon="x" size={44} label={t("proDocSheet.close")} onPress={onClose} />
      </View>
      <Text variant="h3" numberOfLines={4}>{doc.title || t("ad1.title")}</Text>
      <View style={s.pills}>
        <DocStatus status={doc.status} small={false} />
        <FlowBadge flow={doc.flow} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 }, row: { flexDirection: "row", alignItems: "center", gap: 12 }, flex: { flex: 1, gap: 1 }, pills: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 } });
