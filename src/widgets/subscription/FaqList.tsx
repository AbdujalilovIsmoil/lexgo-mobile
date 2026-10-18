import { Card, ListRow, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Frequently asked questions (web lists the questions only).
export function FaqList() {
  const { t } = useT();
  return (
    <Card style={{ gap: 4 }}>
      <Text variant="h4">{t("cs.faqT")}</Text>
      {[1, 2, 3, 4, 5].map((n) => <ListRow key={n} icon="help-circle" title={t(`cs.q${n}`)} chevron={false} />)}
    </Card>
  );
}
