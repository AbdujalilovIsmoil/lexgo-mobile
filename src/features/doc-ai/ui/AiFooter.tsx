import { StyleSheet, View } from "react-native";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { stage: "need" | "section" | "review"; busy: boolean; needOk: boolean; onQuestions: () => void; onBack: () => void; onNext: () => void; onGenerate: () => void };

// Bottom actions per stage: get questions → Back / Next → generate with AI.
export function AiFooter({ stage, busy, needOk, onQuestions, onBack, onNext, onGenerate }: Props) {
  const { t } = useT();
  if (stage === "need") return <Button title={t("dc5.getQuestions")} icon="zap" variant="gradient" full onPress={onQuestions} loading={busy} disabled={!needOk} />;
  return (
    <View style={s.row}>
      <Button title={t("common.back")} icon="chevron-left" variant="line" onPress={onBack} disabled={busy} style={s.back} />
      {stage === "review" ? (
        <Button title={t("dc5.generate")} icon="zap" variant="gradient" onPress={onGenerate} loading={busy} style={s.main} />
      ) : (
        <Button title={t("common.continue")} icon="arrow-right" iconRight variant="gradient" onPress={onNext} disabled={busy} style={s.main} />
      )}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 10 }, back: { flex: 1 }, main: { flex: 2 } });
