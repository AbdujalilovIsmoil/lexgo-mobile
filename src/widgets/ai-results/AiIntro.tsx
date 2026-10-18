import { StyleSheet, View } from "react-native";
import { useMarketMeta } from "@/entities/lawyer";
import { Chip, EmptyState, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Before the first AI search: what to type, with tappable examples
// (real service names from /marketplace/meta, one per category).
export function AiIntro({ onExample }: { onExample: (text: string) => void }) {
  const { t, tList } = useT();
  const { data } = useMarketMeta();
  const seen = new Set<string>();
  const fromMeta = (data?.services ?? []).filter((x) => x.title.length <= 34 && !seen.has(x.categoryId) && (seen.add(x.categoryId), true)).slice(0, 3).map((x) => x.title);
  const examples = fromMeta.length ? fromMeta : tList("mk1.examples");
  return (
    <View style={s.col}>
      <EmptyState icon="zap" title={t("mk1.aiIntroTitle")} text={t("mk1.aiIntroText")} compact />
      <Text variant="caption" tone="gray2" center>{t("mk1.examplesLabel")}</Text>
      <View style={s.chips}>{examples.map((x) => <Chip key={x} label={x} onPress={() => onExample(x)} />)}</View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10, alignItems: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
});
