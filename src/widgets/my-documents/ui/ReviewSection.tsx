import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { View } from "react-native";
import type { DocCan, MyDoc } from "@/entities/my-document";

// Hand the document to the duty advocate when the backend allows it; otherwise say why not (its own words).
export function ReviewSection({ doc, can, onSend }: { doc: MyDoc; can: DocCan; onSend: () => void }) {
  const { t } = useT();
  const c = useColors();
  if (!can.review) return doc.lawyerActive && doc.blockReason ? <Text variant="caption" tone="gray" style={{ paddingHorizontal: 4 }}>{doc.blockReason}</Text> : null;
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon name="briefcase" size={18} color={c.accent} />
        <Text variant="h4">{t("dm5.cardTitle")}</Text>
      </View>
      <Text variant="small" tone="gray">{t("dm5.cardText")}</Text>
      <Button title={t("dm5.cardAction")} icon="send" variant="soft" full onPress={onSend} />
    </Card>
  );
}
