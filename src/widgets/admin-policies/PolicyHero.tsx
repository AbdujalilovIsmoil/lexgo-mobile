import { StyleSheet, View } from "react-native";
import { PRICING, readPricing, readinessTone, SECTIONS, useBusinessHours, usePolicies, useReadiness, useUnverified } from "@/entities/admin-policies";
import { Card, Gauge, Pill, Skeleton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Headline of the policies screen: the production-readiness gauge and the state of the other blocks at a glance.
export function PolicyHero() {
  const { t } = useT();
  const c = useColors();
  const r = useReadiness().data;
  const pol = usePolicies().data;
  const unv = useUnverified().data;
  const hours = useBusinessHours().data;
  if (!r) return <Skeleton height={150} round={20} />;
  const tone = readinessTone(r.status);
  const color = tone === "ok" ? c.ok : tone === "warn" ? c.warn : c.err;
  const filled = SECTIONS.filter((s) => Object.keys(pol?.[s] ?? {}).length).length;
  const rows: [string, string, "ok" | "gray" | "warn"][] = [
    [t("admPolD.hero.sections"), `${filled} / ${SECTIONS.length}`, filled === SECTIONS.length ? "ok" : "warn"],
    [t("admPolD.hero.pricing"), readPricing(pol?.[PRICING]) ? t("admPolC.pr.live") : t("admPolC.pr.notSaved"), readPricing(pol?.[PRICING]) ? "ok" : "gray"],
    ...(unv ? [[t("admPolD.hero.unverified"), t(`admPolB.unv.${unv}`), "gray"] as [string, string, "gray"]] : []),
    ...(hours?.isWorkingTime != null ? [[t("admPolD.hero.hours"), hours.isWorkingTime ? t("admPol.cal.open") : t("admPol.cal.closed"), hours.isWorkingTime ? "ok" : "gray"] as [string, string, "ok" | "gray"]] : []),
  ];
  return (
    <Card style={s.card}>
      <Gauge value={r.total ? r.passed / r.total : 0} text={`${r.passed}/${r.total}`} label={t(`admPolB.ready.${r.status}`) !== `admPolB.ready.${r.status}` ? t(`admPolB.ready.${r.status}`) : r.status || t("admPolD.hero.notReady")} color={color} size={132} />
      <View style={s.list}>{rows.map(([l, v, tn]) => <View key={l} style={s.row}><Text variant="caption" tone="gray" numberOfLines={2} style={s.lbl}>{l}</Text><Pill small tone={tn} label={v} /></View>)}</View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  list: { flex: 1, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" },
  lbl: { flexShrink: 1 },
});
