import { ActivityIndicator, View } from "react-native";
import { ReviewSummary, SectionForm, SectionTabs, type DocAnswers, type DocSection } from "@/entities/doc-form";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { useDocAi } from "../model/useDocAi";

type Props = { f: ReturnType<typeof useDocAi>; sections: DocSection[]; answers: DocAnswers };

// Step 2: the questions the server returned (template fields + AI questions), then a summary.
export function AiQuestions({ f, sections, answers }: Props) {
  const { t } = useT();
  const { wiz } = f;
  return (
    <>
      <View style={{ marginHorizontal: -16 }}>
        <SectionTabs sections={sections} answers={answers} step={wiz.step} onStep={wiz.go} />
      </View>
      {wiz.review ? (
        <View style={{ gap: 12 }}>
          {f.generate.isPending ? <Card style={{ alignItems: "center", gap: 8 }}><ActivityIndicator /><Text variant="small" tone="gray" center>{t("dc5.generating")}</Text></Card> : null}
          <Text variant="h3">{t("dc5.reviewTitle")}</Text>
          <Card tinted><Text variant="small" tone="gray">{t("dc5.reviewText")}</Text></Card>
          <ReviewSummary sections={sections} answers={answers} problems={wiz.problems} onFix={wiz.jump} />
        </View>
      ) : wiz.section ? (
        <SectionForm section={wiz.section} answers={answers} errorOf={wiz.errorOf} onChange={f.set} />
      ) : null}
    </>
  );
}
