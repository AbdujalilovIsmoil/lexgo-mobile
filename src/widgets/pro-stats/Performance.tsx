import { StyleSheet, View } from "react-native";
import { fmtPct, ratePct, speedFill, starFills, val } from "@/entities/pro-stats";
import { MIN_REVIEWS, type Stats } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { fmtRating } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { Card, Icon, Skeleton, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { Block } from "./Block";

function Meter({ label, value, fill, color }: { label: string; value: string; fill: number | undefined; color: string }) {
  return (
    <View style={s.meter} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={s.meterHead}>
        <Text variant="small" tone="gray" style={s.flex} numberOfLines={1}>{label}</Text>
        <Text variant="small" weight="bold" tone={fill == null ? "gray2" : "ink"}>{value}</Text>
      </View>
      <ProgressBar value={fill ?? 0} color={color} />
    </View>
  );
}

// Rating (stars), then response / acceptance rate and speed as bars, a coaching tip and the "Super advokat" checklist.
export function Performance({ stats, loading }: { stats?: Stats; loading: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  if (loading) {
    return (
      <Block title={t("aw9.performance")}>
        <Card style={s.card}>
          <Skeleton width="45%" height={32} />
          <Skeleton height={8} /><Skeleton height={8} /><Skeleton height={8} />
        </Card>
      </Block>
    );
  }
  const p = stats?.performance;
  const response = val(p, "response_rate");
  const accept = val(p, "acceptance_rate");
  const avg = val(p, "avg_response_minutes");
  const rating = val(p, "rating");
  const reviews = stats?.reviews ?? 0;
  const isNew = reviews < MIN_REVIEWS;
  const showRating = !isNew && rating != null && rating > 0;
  const tip = avg != null && avg > 15 ? t("aw9.tipSpeed", { now: avg, target: 15 }) : response != null && (ratePct(response) ?? 0) < 90 ? t("aw9.tipRate") : t("aw9.tipGood");
  const crit = [
    { ok: (rating ?? 0) > 4.5 && !isNew, label: t("aw9.super.rating") },
    { ok: (ratePct(response) ?? 0) > 90, label: t("aw9.super.response") },
    { ok: (stats?.experienceYears ?? 0) >= 3, label: t("aw9.super.exp", { n: stats?.experienceYears ?? 0 }) },
    { ok: (stats?.totalCases ?? 0) >= 10, label: t("aw9.super.cases", { n: stats?.totalCases ?? 0 }) },
  ];
  const done = crit.filter((x) => x.ok).length;
  const ratingLabel = showRating ? `${t("aw9.p.rating")}: ${fmtRating(rating, locale)}, ${t("statUx.reviews", { n: reviews })}` : `${t("aw9.p.rating")}: ${t("aw9.newBadge")}`;
  return (
    <Block title={t("aw9.performance")}>
      <Card style={s.card}>
        <View style={s.ratingRow} accessible accessibilityLabel={ratingLabel}>
          <Text variant="hx">{showRating ? fmtRating(rating, locale) : t("aw9.newBadge")}</Text>
          <View style={s.ratingSide}>
            <View style={s.stars}>
              {starFills(showRating ? rating : 0).map((f, i) => <Icon key={i} name="star" size={18} color={f > 0 ? c.warn : c.line} />)}
            </View>
            <Text variant="caption" tone="gray" numberOfLines={2}>{showRating ? t("statUx.reviews", { n: reviews }) : t("aw9.newHint", { n: MIN_REVIEWS })}</Text>
          </View>
        </View>
        <Meter label={t("aw9.p.response")} value={fmtPct(response)} fill={ratePct(response) == null ? undefined : (ratePct(response) as number) / 100} color={c.ok} />
        <Meter label={t("aw9.p.acceptance")} value={fmtPct(accept)} fill={ratePct(accept) == null ? undefined : (ratePct(accept) as number) / 100} color={c.accent} />
        <Meter label={t("statUx.speed")} value={avg ? t("aw9.minutes", { n: avg }) : "—"} fill={speedFill(avg)} color={c.warn} />
        <View style={[s.tip, { backgroundColor: c.tint }]}>
          <Icon name="info" size={16} color={c.accentStrong} />
          <Text variant="small" style={s.flex}>{tip}</Text>
        </View>
        <View style={s.superHead} accessible accessibilityLabel={`${t("aw9.super.title")}: ${t("statUx.superDone", { done, total: crit.length })}`}>
          <Text variant="small" weight="bold" style={s.flex} numberOfLines={2}>{t("aw9.super.title")}</Text>
          <Text variant="caption" tone="gray">{done}/{crit.length}</Text>
        </View>
        <ProgressBar value={done / crit.length} color={c.accent} />
        {crit.map((x) => (
          <View key={x.label} style={s.crit} accessible accessibilityLabel={x.label} accessibilityState={{ checked: x.ok }}>
            <Icon name={x.ok ? "check-circle" : "circle"} size={18} color={x.ok ? c.ok : c.gray2} />
            <Text variant="small" tone={x.ok ? "ink" : "gray"} style={s.flex}>{x.label}</Text>
          </View>
        ))}
      </Card>
    </Block>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: 16, gap: 14 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  ratingSide: { flex: 1, gap: 4 },
  stars: { flexDirection: "row", gap: 3 },
  meter: { gap: 7 },
  meterHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  tip: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: radius.r },
  superHead: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  crit: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 28 },
});
