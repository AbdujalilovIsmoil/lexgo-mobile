import { StyleSheet, View } from "react-native";
import type { RatingBreakdown } from "@/entities/lawyer";
import { useT } from "@/shared/i18n";
import { fmtDate, fmtRating } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";

const tone = (score: number) => (score >= 75 ? "#22C55E" : score >= 50 ? "#00CFE8" : "#F59E0B");

function duration(seconds: number | null, t: ReturnType<typeof useT>["t"]): string {
  if (seconds === null) return "—";
  const min = Math.max(1, Math.round(seconds / 60));
  return min < 120 ? t("rbd.minutes", { n: min }) : t("rbd.hours", { n: Math.round(min / 60) });
}

// The web's rating breakdown: the stars (or "not rated yet"), the ranking score, each factor out of 100 (with its weight for the seller
// themselves), the facts behind them, the cold-start note and the penalties. `mine` = the seller's own view.
export function RatingBreakdownView({ data: d, mine }: { data: RatingBreakdown; mine?: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      <View style={s.head}>
        {d.rated && d.publicRating !== null ? (
          <View style={s.stars}>
            <Icon name="star" size={18} color="#F4B63F" />
            <Text variant="h3">{fmtRating(d.publicRating, locale)}</Text>
            <Text variant="caption" tone="gray">{t("rbd.reviews", { n: d.reviews })}</Text>
          </View>
        ) : (
          <View style={s.flex}>
            <Text variant="body" weight="bold">{d.unratedText || t("rbd.unrated")}</Text>
            <Text variant="caption" tone="gray">{t("rbd.unratedWhy")}</Text>
          </View>
        )}
        {mine && d.rankingScore !== null ? (
          <View style={[s.rank, { backgroundColor: c.tint }]}>
            <Text variant="h3" tone="accent">{Math.round(d.rankingScore)}</Text>
            <Text variant="caption" tone="gray" center numberOfLines={2}>{t("rbd.ranking")}</Text>
          </View>
        ) : null}
      </View>
      <Text variant="small" tone="gray">{t(mine ? "rbd.leadMine" : "rbd.lead")}</Text>
      {d.factors.map((f) => (
        <View key={f.key} style={s.factor} accessible accessibilityLabel={`${t(`rbd.factor.${f.key}`)}: ${Math.round(f.score)}`}>
          <View style={s.factorHead}>
            <Text variant="small" weight="semibold" style={s.flex} numberOfLines={1}>{t(`rbd.factor.${f.key}`)}</Text>
            {mine && d.weights?.[f.key] !== undefined ? <Text variant="caption" tone="gray">{t("rbd.weight", { n: d.weights[f.key] })}</Text> : null}
            <Text variant="small" weight="bold">{Math.round(f.score)}</Text>
          </View>
          <ProgressBar value={f.score / 100} color={tone(f.score)} />
        </View>
      ))}
      <View style={[s.facts, { borderColor: c.line }]}>
        <Fact label={t("rbd.completed")} value={d.terminal ? t("rbd.ofN", { n: d.completed, of: d.terminal }) : String(d.completed)} />
        <Fact label={t("rbd.response")} value={duration(d.responseSeconds, t)} />
        <Fact label={t("rbd.experience")} value={d.experienceYears ? t("rbd.years", { n: d.experienceYears }) : t("rbd.noExperience")} />
      </View>
      {mine && d.coldStart && !d.rated ? <Text variant="caption" tone="gray">{t("rbd.coldStart")}</Text> : null}
      {mine && d.penalties ? (
        <View style={s.pen}>
          <Text variant="small" weight="bold">{t("rbd.penalties")}</Text>
          {d.penalties.complaints || d.penalties.refunds ? (
            <>
              {d.penalties.complaints ? <Text variant="caption" tone="err">{t("rbd.penComplaints", { n: d.penalties.complaints })}</Text> : null}
              {d.penalties.refunds ? <Text variant="caption" tone="err">{t("rbd.penRefunds", { n: d.penalties.refunds })}</Text> : null}
            </>
          ) : <Text variant="caption" tone="ok">{t("rbd.noPenalties")}</Text>}
        </View>
      ) : null}
      {d.calculatedAt || d.policyVersion !== null ? (
        <Text variant="caption" tone="gray2">{[d.calculatedAt ? t("rbd.calculatedAt", { date: fmtDate(d.calculatedAt, locale) }) : "", d.policyVersion !== null ? t("rbd.policy", { n: d.policyVersion }) : ""].filter(Boolean).join(" · ")}</Text>
      ) : null}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.fact}>
      <Text variant="caption" tone="gray" numberOfLines={2}>{label}</Text>
      <Text variant="small" weight="bold" numberOfLines={1}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  stars: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  flex: { flex: 1 },
  rank: { width: 92, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 14, alignItems: "center" },
  factor: { gap: 6 },
  factorHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  facts: { flexDirection: "row", gap: 10, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  fact: { flex: 1, gap: 2 },
  pen: { gap: 4 },
});
