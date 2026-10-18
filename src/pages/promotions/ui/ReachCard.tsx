import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { promoPeriod, useAnalytics } from "@/entities/promotion";
import { fmtDate } from "@/shared/lib/format";
import { todayKey } from "@/shared/lib/pro/dates";
import { radius, useColors } from "@/shared/theme";
import { Card, Chip, ErrorView, Icon, Skeleton, Text, type IconName } from "@/shared/ui";
import { fmtCompact } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { FilterSheet, NO_FILTERS, type Filters } from "./FilterSheet";
import { Sparkline } from "./Sparkline";

type Metric = { key: string; icon: IconName; value?: number };

// «Qamrov tahlili»: one card — the 14-day impressions trend, the four reach numbers as a 2x2 grid and a single «Filtr» chip
// (promotion type + dates in a sheet) instead of three always-open fields.
export function ReachCard({ since = "" }: { since?: string }) {
  const { t, locale } = useT();
  const c = useColors();
  const [applied, setApplied] = useState<Filters>(NO_FILTERS);
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState(false);
  const q = useAnalytics({ placement: applied.type || undefined, from: applied.from || undefined, to: applied.to || undefined });
  const d = q.data;
  const on = !!(applied.type || applied.from || applied.to);
  const metrics: Metric[] = [
    { key: "impressions", icon: "eye", value: d?.impressions },
    { key: "searchAppearances", icon: "search", value: d?.searchAppearances },
    { key: "profileClicks", icon: "target", value: d?.profileClicks },
    { key: "contactRequests", icon: "message-circle", value: d?.contactRequests },
  ];
  const trend = (d?.series ?? []).slice(-14).map((x) => x.impressions);
  const fromStart = !!since && applied.from === promoPeriod(since, todayKey()).from && applied.to === todayKey();
  const show = () => { setDraft(applied); setOpen(true); };
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="h4" style={s.fill} accessibilityRole="header">{t("promoSeller.analyticsTitle")}</Text>
        <Chip label={t("promoSeller.ck.filterBtn")} icon="sliders" active={on} onPress={show} />
      </View>
      {fromStart ? <Text variant="caption" tone="gray">{t("promoSeller.ck.sinceNote", { date: fmtDate(`${applied.from}T12:00:00`, locale) })}</Text> : null}
      {q.isError && !d ? (
        <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />
      ) : (
        <>
          <View accessible accessibilityLabel={`${t("promoSeller.ck.trend")}${trend.some((v) => v > 0) ? "" : `. ${t("promoSeller.ck.trendEmpty")}`}`} style={s.trend}>
            <Text variant="caption" tone="gray">{t("promoSeller.ck.trend")}</Text>
            {q.isLoading ? <Skeleton height={44} round={8} /> : <Sparkline values={trend} />}
          </View>
          <View style={s.grid}>
            {metrics.map((m) => (
              <View key={m.key} accessible accessibilityLabel={`${t(`promoSeller.${m.key}`)}: ${d ? fmtCompact(m.value ?? 0) : "—"}`} style={[s.tile, { backgroundColor: c.surface2 }]}>
                <View style={s.label}>
                  <Icon name={m.icon} size={14} color={c.accent} />
                  <Text variant="caption" tone="gray" numberOfLines={2} style={s.fill}>{t(`promoSeller.${m.key}`)}</Text>
                </View>
                {q.isLoading ? <Skeleton height={26} width="50%" /> : <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit>{d ? fmtCompact(m.value ?? 0) : "—"}</Text>}
              </View>
            ))}
          </View>
        </>
      )}
      <FilterSheet since={since} visible={open} value={draft} onChange={setDraft} onClose={() => setOpen(false)} onApply={() => { setApplied(draft); setOpen(false); }} onReset={() => { setDraft(NO_FILTERS); setApplied(NO_FILTERS); setOpen(false); }} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
  trend: { gap: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", flexGrow: 1, borderRadius: radius.r, padding: 12, gap: 6, minHeight: 84 },
  label: { flexDirection: "row", alignItems: "center", gap: 6 },
});
