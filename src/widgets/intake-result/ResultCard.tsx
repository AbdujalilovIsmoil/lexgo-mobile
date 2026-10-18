import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { Classification } from "@/entities/intake";
import type { MyMatch } from "@/entities/lawyer";
import { AnswerFooter, MatchPicks, MatchPicksSkeleton, OfferCard, SourceList } from "@/features/intake-analyze";
import { Button, Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ResultHead, word } from "./ResultHead";

type Props = { result: Classification; matches: MyMatch[]; loading?: boolean; urgent: boolean; text: string };

// Level 2 offers (3 priced levels) or the level-1 catalog link, matched advocates, sources, the
// always-visible disclaimer, feedback and the SOS shortcut for non-urgent results (the last four in AnswerFooter).
export function ResultCard({ result: r, matches, loading, urgent, text }: Props) {
  const { t } = useT();
  const router = useRouter();
  return (
    <Card style={s.card}>
      <ResultHead result={r} urgent={urgent} text={text} />
      {r.offers.length ? (
        <View style={s.col}>
          <Text variant="h4">{t("cxIn.offersTitle")} <Text variant="caption" tone="gray">{t("cxIn.offersSub")}</Text></Text>
          {r.offers.map((o) => <OfferCard key={o.serviceId} offer={o} />)}
        </View>
      ) : r.recommendedService ? (
        <Button title={t("cxIn.orderRecommended")} variant="gradient" icon="arrow-right" iconRight full onPress={() => router.push({ pathname: "/services", params: { q: word(t, "categories", r.recommendedService) } })} />
      ) : null}
      {loading ? <MatchPicksSkeleton /> : null}
      {matches.length ? <MatchPicks matches={matches} title={t("cxIn.matchesTitle")} /> : null}
      <SourceList sources={r.sources} title={t("cxIn.sourcesTitle")} />
      <AnswerFooter key={r.leadId || r.summary} unverified={r.answerStatus === "reliable_source_required"} disclaimer={r.disclaimer} leadId={r.leadId || ""} urgent={urgent} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  col: { gap: 10 },
});
