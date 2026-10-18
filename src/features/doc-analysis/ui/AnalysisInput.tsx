import { StyleSheet, View } from "react-native";
import { RuleCard, useAnalysisRules } from "@/entities/doc-analysis";
import { Button, Input, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { useDocAnalysis } from "../model/useDocAnalysis";
import { FileCard } from "./FileCard";
import { OptionsPanel } from "./OptionsPanel";
import { PickArea } from "./PickArea";
import { QuotePanel } from "./QuotePanel";

// Step 1: a file (preferred, so the server counts the pages) or pasted text.
export function AnalysisInput({ d }: { d: ReturnType<typeof useDocAnalysis> }) {
  const { t } = useT();
  const rules = useAnalysisRules().data?.rule;
  const running = d.status === "running";
  return (
    <View style={s.col}>
      {d.file ? <FileCard file={d.file} onRemove={() => d.setFile(null)} /> : <PickArea onPress={() => void d.pick()} />}
      {d.file ? null : (
        <>
          <Text variant="caption" tone="gray2" center>{t("docs.or")}</Text>
          <Input value={d.text} onChangeText={d.setText} placeholder={t("docs.textPh")} multiline hint={t("dc7.textHint", { n: d.minText })} style={s.ta} />
        </>
      )}
      {d.error ? <Text variant="small" tone="err">{d.error}</Text> : null}
      <OptionsPanel o={d.opts} />
      <QuotePanel q={d.quote} pageCount={d.opts.pageCount} pagesOk={d.opts.pagesOk} />
      {rules ? <RuleCard rule={rules} /> : null}
      {running ? <View style={s.col}><Skeleton height={70} round={20} /><Skeleton height={44} /><Skeleton height={44} /></View> : null}
      <Button title={running ? t("docs.running") : t("docs.run")} onPress={() => void d.run()} disabled={!d.canRun} loading={running} variant="gradient" size="lg" icon="zap" full />
      <Text variant="caption" tone="gray" center>{t("dc7.serverPages")}</Text>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 14 }, ta: { minHeight: 120, textAlignVertical: "top" } });
