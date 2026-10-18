import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { ProgressBar } from "@/shared/ui/charts";
import { useT } from "@/shared/i18n";
import { answerText, type DocCan, type MyDoc, type UnlockPolicy } from "@/entities/my-document";

type Props = { doc: MyDoc; can: DocCan; policy?: UnlockPolicy; onOpen: () => void };

// Questionnaire progress and the way into the answers sheet (edit while the backend allows, else read).
export function AnswersSection({ doc, can, policy, onOpen }: Props) {
  const { t } = useT();
  const total = doc.fields.length;
  if (!total) return null;
  const done = doc.fields.filter((f) => answerText(doc.answers, f.name) !== "").length;
  if (!can.edit && done === 0) return null;
  const miss = can.edit ? policy?.missing.length ?? 0 : 0;
  return (
    <SectionCard title={t("dm3.answers")}>
      <View style={{ gap: 6 }}>
        <ProgressBar value={done / total} />
        <Text variant="caption" tone="gray">{t("dm4.progress", { n: done, total })}</Text>
        {miss > 0 ? <Text variant="caption" tone="warn">{t("dm3.missingN", { n: miss })}</Text> : null}
      </View>
      <Button title={can.edit ? (done ? t("dm3.editAnswers") : t("dm3.fillAnswers")) : t("dm3.viewAnswers")} icon={can.edit ? "edit-3" : "list"} variant={can.edit ? "primary" : "soft"} full onPress={onOpen} />
    </SectionCard>
  );
}
