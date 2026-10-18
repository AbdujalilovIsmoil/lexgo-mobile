import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocAnalysis } from "../model/types";
import { PageBadge } from "./PageBadge";
import { RiskRow } from "./RiskRow";

// The AI's answer: facts, summary, risks by severity, recommendations, full write-up.
export function AnalysisResult({ result }: { result: DocAnalysis }) {
  const c = useColors();
  const { t } = useT();
  const [full, setFull] = useState(false);
  const p = result.pricing;
  const count = (lvl: string) => result.risks.filter((r) => r.level === lvl).length;
  return (
    <View style={s.col}>
      <View style={s.meta}>
        {result.fileName ? <Pill label={result.fileName} tone="gray" icon="file-text" small /> : null}
        <PageBadge result={result} />
        {p ? <Pill label={p.aiIncluded || !p.totalAmount ? t("dc8.aiIncluded") : t("dc8.aiPaid")} tone="ok" small /> : null}
      </View>
      <Card tinted style={s.card}><Text variant="h4">{t("docs.summary")}</Text><Text variant="small" tone="gray">{result.summary || t("cxDa.noSummary")}</Text></Card>
      <View style={s.head}>
        <Text variant="h4">{t("docs.risks")}</Text>
        <Text variant="caption" tone="gray">{t("dc8.riskCount", { h: count("high"), m: count("medium"), l: count("low") })}</Text>
      </View>
      {result.risks.length ? result.risks.map((r, i) => <RiskRow key={i} risk={r} />) : <Text variant="small" tone="gray">{t("docs.noRisks")}</Text>}
      {result.recommendations.length ? <Text variant="h4">{t("docs.recs")}</Text> : null}
      {result.recommendations.map((r, i) => (
        <View key={i} style={s.rec}><Icon name="check-circle" size={18} color={c.ok} /><Text variant="small" style={s.flex}>{r}</Text></View>
      ))}
      {result.analysisText ? (
        <>
          <Button title={full ? t("dc8.hideFull") : t("dc8.showFull")} variant="soft" size="sm" icon={full ? "chevron-up" : "chevron-down"} onPress={() => setFull(!full)} />
          {full ? <Card style={s.card}><Text variant="small" selectable>{result.analysisText.replace(/^#+\s*/gm, "").replace(/\*\*/g, "")}</Text></Card> : null}
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { gap: 6 },
  rec: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  flex: { flex: 1 },
});
