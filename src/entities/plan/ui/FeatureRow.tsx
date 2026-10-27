import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { PlanFeature } from "../model/features";
import { useTermValue } from "../model/useFeatureLabel";

// One feature of the current paid period as the backend reports it: locked, a counter (used / limit, what is left, when it resets), a
// limit without a counter (e.g. 365 days of history) or unlimited. `first` drops the divider above it.
export function FeatureRow({ f, label, first }: { f: PlanFeature; label: string; first?: boolean }) {
  const c = useColors();
  const { t, locale } = useT();
  const term = useTermValue();
  const off = f.mode === "unavailable";
  const counter = f.mode === "limited" && f.limit !== null && f.used !== null;
  const share = counter && f.limit ? Math.max(0, Math.min(1, (f.used ?? 0) / f.limit)) : null;
  const value = off ? t("mf.plan.unavailable") : f.mode === "unlimited" ? t("mf.plan.unlimited") : counter ? t("mf.plan.used", { used: f.used ?? 0, limit: f.limit ?? 0 }) : f.remaining !== null ? t("mf.plan.remaining", { n: f.remaining }) : term(f);
  const facts = f.mode === "limited" ? [counter && f.remaining !== null ? t("mf.plan.remaining", { n: f.remaining }) : "", f.resetsAt ? t("mf.plan.resets", { date: fmtDate(f.resetsAt, locale) }) : ""].filter(Boolean) : [];
  return (
    <View style={[s.feature, !first && { borderTopColor: c.line, borderTopWidth: 1, paddingTop: 10 }]}>
      <View style={s.row}>
        <Icon name={off ? "lock" : f.mode === "unlimited" ? "check-circle" : "bar-chart-2"} size={16} color={off ? c.gray : f.mode === "unlimited" ? c.ok : c.accent} />
        <Text variant="small" weight="semibold" tone={off ? "gray" : "ink"} style={s.flex}>{label}</Text>
        <Text variant="caption" weight="semibold" tone={off ? "gray" : f.mode === "unlimited" ? "ok" : "accent"}>{value}</Text>
      </View>
      {share !== null ? <View style={[s.track, { backgroundColor: c.surface2 }]}><View style={[s.bar, { width: `${share * 100}%`, backgroundColor: share >= 1 ? c.err : c.accent }]} /></View> : null}
      {facts.length ? <Text variant="caption" tone="gray2">{facts.join(" · ")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  feature: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  bar: { height: 6, borderRadius: 3 },
});
