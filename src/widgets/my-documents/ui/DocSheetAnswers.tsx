import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { useT } from "@/shared/i18n";
import type { AnswerPeek } from "@/entities/my-document";
import { SheetBlock } from "./SheetBlock";

// Short summary of what the client filled in: progress and the first few answers (all of them live on the full page).
export function DocSheetAnswers({ peek }: { peek: AnswerPeek }) {
  const { t } = useT();
  if (!peek.total) return null;
  return (
    <SheetBlock title={t("docSheet.answers")}>
      <View style={s.gap}>
        <ProgressBar value={peek.done / peek.total} />
        <Text variant="caption" tone="gray">{peek.done ? t("docSheet.answersCount", { n: peek.done, total: peek.total }) : t("docSheet.noAnswers")}</Text>
      </View>
      {peek.items.map((a) => (
        <View key={a.label} style={s.item}>
          <Text variant="caption" tone="gray" numberOfLines={1}>{a.label}</Text>
          <Text variant="small" numberOfLines={2}>{a.value}</Text>
        </View>
      ))}
    </SheetBlock>
  );
}

const s = StyleSheet.create({ gap: { gap: 6 }, item: { gap: 2 } });
