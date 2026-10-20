import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useLegalCorpus } from "@/entities/intake";
import { IntakeForm, MatchPicks, MatchPicksSkeleton, SourceList, SourcesSkeleton, UrgentBlock, useIntake } from "@/features/intake-analyze";
import { ResultCard } from "@/widgets/intake-result";
import { Button, Card, Header, Icon, Screen, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

// AI problem intake (web /portal/client/intake): describe → POST /ai/classify → urgency, offers,
// matched advocates, sources. Before the first analysis the official legal sources are listed.
export function IntakePage() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const i = useIntake();
  const corpusQ = useLegalCorpus();
  const corpus = corpusQ.data ?? [];
  const res = useInstructorTarget("intake:result", { label: t("cxIn.resultTitle"), type: "section" });
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <Header title={t("cxIn.title")} />
      <Screen topInset={false} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text variant="small" tone="gray">{t("cxIn.subtitle")}</Text>
        <IntakeForm intake={i} />
        {!i.result && i.prevLoading ? <MatchPicksSkeleton /> : null}
        {!i.result && i.prev.length ? <MatchPicks matches={i.prev} title={t("cxIn.prevMatchesTitle")} /> : null}
        {i.result ? (
          <View {...res} style={s.col}>
            {i.urgent ? <UrgentBlock /> : null}
            <ResultCard result={i.result} matches={i.matches} loading={i.matchesBusy} urgent={i.urgent} text={i.text} />
          </View>
        ) : null}
        {i.failed ? (
          <Card style={s.col}>
            <View style={s.row}><Icon name="alert-triangle" size={18} color={c.err} /><Text variant="h4">{t("cxIn.failedTitle")}</Text></View>
            <Text variant="small" tone="gray">{t("cxIn.failedText")}</Text>
            <Button title={t("cxIn.orSos")} onPress={() => router.push("/sos")} />
          </Card>
        ) : null}
        {!i.result && corpusQ.isPending ? <Card><SourcesSkeleton /></Card> : null}
        {!i.result && corpus.length ? <Card><SourceList sources={corpus} title={t("cxIn.corpusTitle")} lead={t("cxIn.corpusLead")} /></Card> : null}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, content: { gap: 14, paddingTop: 4 }, col: { gap: 12 }, row: { flexDirection: "row", alignItems: "center", gap: 8 } });
