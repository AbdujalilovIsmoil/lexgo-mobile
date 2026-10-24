import { useState } from "react";
import { useGrid } from "@/shared/lib/useGrid";
import * as Clipboard from "expo-clipboard";
import { StyleSheet, View } from "react-native";
import { AI_TOOLS, useCaseAi, type CaseAiTool } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { brand, useColors } from "@/shared/theme";
import { Button, Card, Icon, MarkdownText, PressableScale, Text, toast, type IconName } from "@/shared/ui";
import Animated from "react-native-reanimated";

const ICON: Record<CaseAiTool, IconName> = { summary: "align-left", chronology: "git-commit", missing_docs: "file-minus", questions: "help-circle" };

// AI helpers over the case as four tiles (summary, chronology, missing documents, client questions); the answer appears below, with copy.
export function CaseAi({ caseId }: { caseId: string }) {
  const grid = useGrid({ min: 220 });
  const { t } = useT();
  const c = useColors();
  const ai = useCaseAi();
  const [tool, setTool] = useState<CaseAiTool | null>(null);
  const [text, setText] = useState("");
  const run = (k: CaseAiTool) => {
    setTool(k);
    setText("");
    ai.mutate({ id: caseId, tool: k }, { onSuccess: setText });
  };
  return (
    <View style={s.col}>
      <Text variant="small" tone="gray">{t("aw5.aiLead")}</Text>
      <View style={s.grid} onLayout={grid.onLayout}>
        {grid.ready ? AI_TOOLS.map((k) => {
          const on = tool === k;
          return (
            <Animated.View key={k} layout={grid.move} style={[s.cell, grid.cell]}>
              <PressableScale disabled={ai.isPending} onPress={() => run(k)} style={[s.tile, { backgroundColor: on ? c.tint2 : c.surface, borderColor: on ? brand.b600 : c.line }]}>
                <View style={[s.ico, { backgroundColor: on ? brand.b600 : c.tint2 }]}><Icon name={ICON[k]} size={18} color={on ? "#FFFFFF" : c.accent} /></View>
                <Text variant="small" weight="bold" numberOfLines={2}>{t(`aw5.tool.${k}`)}</Text>
              </PressableScale>
            </Animated.View>
          );
        }) : null}
      </View>
      {ai.isPending ? <Text variant="small" tone="gray" center>{t("csd.aiRun")}</Text> : null}
      {text && !ai.isPending ? (
        <Card style={s.col}>
          <Text variant="small" weight="bold" tone="gray">{t("csd.aiResult")}</Text>
          <MarkdownText text={text} color={c.ink} linkColor={c.accent} mutedColor={c.gray} />
          <Text variant="caption" tone="warn">{t("aw5.aiNote")}</Text>
          <Button title={t("aw5.copy")} icon="copy" size="sm" variant="soft" onPress={() => void Clipboard.setStringAsync(text).then(() => toast(t("adm.copied"), "ok"))} />
        </Card>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "48.5%" },
  tile: { flexGrow: 1, gap: 10, padding: 14, borderRadius: 18, borderWidth: 1.5, minHeight: 92 }, // fills its cell, as tall as the row
  ico: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
