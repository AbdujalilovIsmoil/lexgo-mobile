import { StyleSheet, View } from "react-native";
import type { MyRating } from "@/entities/lawyer";
import { useT } from "@/shared/i18n";
import { fmtDate, fmtRating } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const show = (n: number) => String(Math.round(n * 10) / 10);

// "My rating" (GET /marketplace/me/rating, contract §19): the public rating or the unrated text, each component the backend returns as a
// labelled bar (the bar is clamped to 0..100, the number is the backend's), the metrics and the policy version. Nothing is computed here.
export function MyRatingView({ data: d }: { data: MyRating }) {
  const { t, locale } = useT();
  const c = useColors();
  const minutes = d.responseSeconds === null ? "—" : t("rt3.minutes", { n: d.responseSeconds > 0 ? Math.max(1, Math.round(d.responseSeconds / 60)) : 0 });
  const foot = [d.calculatedAt ? t("rt3.calculated", { date: fmtDate(d.calculatedAt, locale) }) : "", d.policyVersion ? t("rt3.policy", { v: d.policyVersion }) : ""].filter(Boolean).join(" · ");
  return (
    <View style={s.col}>
      {d.rated ? (
        <View style={s.stars}>
          <Icon name="star" size={18} color="#F4B63F" />
          <Text variant="h3">{fmtRating(d.rating, locale)}</Text>
          <Text variant="caption" tone="gray">{t("rt3.reviews", { n: d.reviews })}</Text>
        </View>
      ) : (
        <View style={s.stars}>
          <Text variant="body" weight="bold">{d.unratedText || t("rt3.unrated")}</Text>
          <Text variant="caption" tone="gray">{t("rt3.reviews", { n: d.reviews })}</Text>
        </View>
      )}
      <Text variant="small" tone="gray">{t("rt3.lead")}</Text>
      {d.parts.map((p) => {
        const label = tOr(t, `rt3.c.${p.key}`, p.key);
        return (
          <View key={p.key} style={s.part} accessible accessibilityLabel={`${label}: ${show(p.value)}`}>
            <View style={s.partHead}>
              <Text variant="small" weight="semibold" style={s.flex} numberOfLines={2}>{label}</Text>
              <Text variant="small" weight="bold" tone={p.penalty ? "err" : "ink"}>{show(p.value)}</Text>
            </View>
            <ProgressBar value={clamp(p.value) / 100} color={p.penalty ? c.err : c.accent} />
          </View>
        );
      })}
      <View style={[s.facts, { borderColor: c.line }]}>
        <Fact label={t("rt3.m.completed")} value={d.completed === null ? "—" : String(d.completed)} />
        <Fact label={t("rt3.m.terminal")} value={d.terminal === null ? "—" : String(d.terminal)} />
        <Fact label={t("rt3.m.response")} value={minutes} />
        <Fact label={t("rt3.m.experience")} value={d.experienceYears === null ? "—" : t("rt3.years", { n: show(d.experienceYears) })} />
      </View>
      {foot ? <Text variant="caption" tone="gray2">{foot}</Text> : null}
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
  flex: { flex: 1 },
  stars: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  part: { gap: 6 },
  partHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  facts: { flexDirection: "row", flexWrap: "wrap", rowGap: 10, columnGap: 10, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  fact: { flexBasis: "45%", flexGrow: 1, gap: 2 },
});
