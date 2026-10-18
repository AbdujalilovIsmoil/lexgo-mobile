import { View } from "react-native";
import { PreviewText, ReviewSummary, usePreview, type DocAnswers, type DocSchema, type Problem } from "@/entities/doc-form";
import { Skeleton, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { useT } from "@/shared/i18n";

type Props = { schema: DocSchema; serviceId: string; answers: DocAnswers; wire: Record<string, string>; problems: Problem[]; onFix: (section: number) => void };

// Last step: unanswered fields first, the entered values, then the server's preview.
export function ReviewStep({ schema, serviceId, answers, wire, problems, onFix }: Props) {
  const { t } = useT();
  const q = usePreview(serviceId, wire, true);
  return (
    <View style={{ gap: 14 }}>
      <Text variant="h3">{t("dc2.reviewTitle")}</Text>
      <Text variant="small" tone="gray">{problems.length ? t("dc2.reviewFix") : t("dc2.reviewOk")}</Text>
      <ReviewSummary sections={schema.sections} answers={answers} problems={problems} onFix={onFix} />
      <Text variant="h4">{t("dc4.previewTitle")}</Text>
      {q.data ? (
        <>
          <ProgressBar value={q.data.percent / 100} />
          <PreviewText text={q.data.text} />
        </>
      ) : q.isError ? <Text variant="small" tone="err">{t("dc4.previewFailed")}</Text> : <Skeleton height={160} round={16} />}
    </View>
  );
}
