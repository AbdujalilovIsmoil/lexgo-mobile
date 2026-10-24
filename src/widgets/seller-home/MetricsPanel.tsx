import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MIN_REVIEWS_FOR_RATING, n, pct, type Cabinet } from "@/entities/pro-workspace";
import { useSession } from "@/entities/session";
import { readJson, writeJson } from "@/shared/lib/storage";
import { fmtRating } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Icon, Text, Toggle } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Panel } from "./Panel";
import { Tile, tilesStyle } from "./Tile";
import { useGrid } from "@/shared/lib/useGrid";

// "Ko'rsatkichlarim": response and acceptance rate, average answer time and rating (a "new" badge under five reviews), the
// vacation switch (kept on the phone until the backend stores availability), a coaching tip and the four "Super advokat" steps.
export function MetricsPanel({ cabinet, i }: { cabinet: Cabinet; i: number }) {
  const grid = useGrid({ count: 4 });
  const { t, locale } = useT();
  const c = useColors();
  const uid = useSession()?.user.id ?? "";
  const key = `lexgo_vacation_${uid}`;
  const [vac, setVac] = useState(false);
  useEffect(() => void readJson<boolean>(key).then((v) => setVac(v === true)), [key]);
  const flip = (v: boolean) => { setVac(v); void writeJson(key, v); };
  const p = cabinet.performance;
  const response = n(p, "response_rate");
  const acceptance = p.acceptance_rate == null ? null : n(p, "acceptance_rate");
  const avg = n(p, "avg_response_minutes");
  const rating = n(p, "rating");
  const isNew = cabinet.profile.reviews < MIN_REVIEWS_FOR_RATING;
  const tip = avg > 15 ? t("shm.sd.metrics.tipSpeed", { now: avg, target: 15 }) : response < 0.9 && pct(response) < 90 ? t("shm.sd.metrics.tipRate") : t("shm.sd.metrics.tipGood");
  const steps = [
    { ok: rating > 4.5, label: t("shm.sd.metrics.superRating") },
    { ok: response > 0.9 && pct(response) > 90, label: t("shm.sd.metrics.superResponse") },
    { ok: cabinet.profile.experienceYears >= 3, label: t("shm.sd.metrics.superExperience", { n: cabinet.profile.experienceYears }) },
    { ok: cabinet.profile.totalCases >= 10, label: t("shm.sd.metrics.superCases", { n: cabinet.profile.totalCases }) },
  ];
  return (
    <Panel i={i} icon="trending-up" tint="#00A870" title={t("shm.sd.metrics.title")} fold={`${pct(response)}% · ${avg ? t("shm.sd.metrics.minutes", { n: avg }) : "—"} · ${isNew ? t("shm.sd.metrics.newBadge") : rating ? fmtRating(rating, locale) : "—"}`}>
      <View style={[s.vacRow, { backgroundColor: vac ? c.warnBg : c.surface2 }]}>
        <Icon name="sun" size={18} color={vac ? c.warn : c.gray} />
        <Text variant="small" weight="bold" style={s.flex}>{vac ? t("shm.sd.metrics.vacationOn") : t("shm.sd.metrics.vacationOff")}</Text>
        <Toggle value={vac} onChange={flip} label={t("shm.sd.metrics.vacationOff")} />
      </View>
      {vac ? <View style={s.note}><Icon name="sun" size={16} color={c.warn} /><Text variant="small" style={[s.flex, { color: c.warn }]}>{t("shm.sd.metrics.vacationNote")}</Text></View> : null}
      <View style={tilesStyle.grid} onLayout={grid.onLayout}>
        <View style={[tilesStyle.half, grid.cell]}><Tile icon="trending-up" tone="#00A870" bar={pct(response)} value={`${pct(response)}%`} label={t("shm.sd.metrics.responseRate")} /></View>
        <View style={[tilesStyle.half, grid.cell]}><Tile icon="check-circle" tone="#1668F0" bar={acceptance == null ? undefined : pct(acceptance)} value={acceptance == null ? "—" : `${pct(acceptance)}%`} label={t("shm.sd.metrics.acceptanceRate")} /></View>
        <View style={[tilesStyle.half, grid.cell]}><Tile icon="clock" tone="#7A5CFF" value={avg ? t("shm.sd.metrics.minutes", { n: avg }) : "—"} label={t("shm.sd.metrics.avgResponse")} /></View>
        <View style={[tilesStyle.half, grid.cell]}><Tile icon="star" tone="#F5B301" value={isNew ? t("shm.sd.metrics.newBadge") : rating ? fmtRating(rating, locale) : "—"} label={t("shm.sd.metrics.rating")} /></View>
      </View>
      {isNew ? <Text variant="caption" tone="gray">{t("shm.sd.metrics.newBadgeHint")}</Text> : null}
      <Text variant="small" tone="gray">{tip}</Text>
      <Text variant="caption" tone="gray2">{t("shm.sd.metrics.ratingBreakdown")}</Text>
      <View style={s.super}>
        <Text variant="small" weight="bold">{t("shm.sd.metrics.superTitle")}</Text>
        <Text variant="caption" tone="gray">{t("shm.sd.metrics.superLead")}</Text>
        {steps.map((x, k) => (
          <View key={k} style={s.step}>
            <View style={[s.num, { backgroundColor: x.ok ? c.ok : c.surface2 }]}>{x.ok ? <Icon name="check" size={13} color="#FFFFFF" /> : <Text variant="caption" weight="bold" tone="gray">{k + 1}</Text>}</View>
            <Text variant="small" weight={x.ok ? "bold" : "regular"} tone={x.ok ? "ink" : "gray"} style={s.flex}>{x.label}</Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}

const s = StyleSheet.create({
  vacRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingLeft: 14, paddingRight: 10, borderRadius: 14 },
  note: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  super: { gap: 8, marginTop: 4 },
  step: { flexDirection: "row", alignItems: "center", gap: 10 },
  num: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
