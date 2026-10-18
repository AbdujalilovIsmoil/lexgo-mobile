import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { CLIENT_STAGES, type ClientStage } from "@/entities/client-case";

// The 5 simplified client steps; a closed order shows its own label instead.
export function StageTrack({ stage }: { stage: ClientStage }) {
  const c = useColors();
  const { t } = useT();
  if (stage === "closed") return <Text variant="caption" tone="gray">{t("ccs.stage.closed")}</Text>;
  const idx = CLIENT_STAGES.indexOf(stage);
  return (
    <View style={s.wrap}>
      <View style={s.bar}>
        {CLIENT_STAGES.map((x, i) => <View key={x} style={[s.seg, { backgroundColor: i <= idx ? c.accent : c.line }]} />)}
      </View>
      <Text variant="caption" tone="gray">{t("ccs.stageOf", { n: idx + 1, total: CLIENT_STAGES.length })} · {t(`ccs.stage.${stage}`)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 4 },
  bar: { flexDirection: "row", gap: 4 },
  seg: { flex: 1, height: 5, borderRadius: 3 },
});
