import { View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { docCan, type DocReq } from "@/entities/doc-queue";

// "The editor is closed for this request" — in the backend's own words (editor_block_reason), never invented.
export function DocBlock({ doc }: { doc: DocReq }) {
  const { t } = useT();
  const c = useColors();
  if (!docCan(doc, "", false).blocked) return null;
  return (
    <View style={{ flexDirection: "row", gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.warnBg }}>
      <Icon name="lock" size={18} color={c.warn} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="small" weight="bold" style={{ color: c.warn }}>{t("ad1.blockedTitle")}</Text>
        <Text variant="small">{doc.blockReason || t("ad1.blockedFallback")}</Text>
        {!doc.systemEditor ? <Text variant="caption" tone="gray">{t("ad1.noSystemEditor")}</Text> : null}
      </View>
    </View>
  );
}
