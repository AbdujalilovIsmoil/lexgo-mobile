import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { acceptRenewal, featureKeys, setAutoRenew, useContract, useMyFeatures, type PlanFeature } from "@/entities/plan";
import { Button, Card, Icon, Pill, Text, toast } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { fmtDate } from "@/shared/lib/format";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

type Props = { onUpgrade?: () => void }; // "choose a plan" when a feature is locked (not shown on the plans page itself)

// TZ.md §12 "My plan": the features of the current paid period as the backend reports them — locked (with the way to another plan), a
// counter with what is left and when it resets, or unlimited. When the plan's terms changed for the next period, the client agrees to them
// (or turns renewal off); the current period keeps its own snapshot either way.
export function MyPlanCard({ onUpgrade }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const qc = useQueryClient();
  const q = useMyFeatures();
  const f = q.data;
  const contract = useContract(f?.subscriptionId ?? "");
  const [busy, setBusy] = useState<"" | "consent" | "stop">("");
  const [answered, setAnswered] = useState<"" | "consent" | "stop">("");
  if (!f || (!f.subscriptionId && !f.items.length)) return null;
  const k = contract.data;
  const name = k ? k.names[locale] || k.names.uz || k.title : "";
  const ask = !!k?.termsChanged && k.consentAccepted !== true && !answered;
  const run = async (kind: "consent" | "stop") => {
    if (!k || busy) return;
    setBusy(kind);
    try {
      if (kind === "consent") await acceptRenewal(k.subscriptionId);
      else await setAutoRenew(k.subscriptionId, false);
      successHaptic();
      setAnswered(kind);
      toast(t(kind === "consent" ? "mf.plan.consentDone" : "mf.plan.stopDone"), "ok");
      void qc.invalidateQueries({ queryKey: featureKeys.contract(k.subscriptionId) });
    } catch {
      errorHaptic();
      toast(t(kind === "consent" ? "mf.plan.consentFailed" : "mf.plan.stopFailed"), "err");
    } finally {
      setBusy("");
    }
  };
  const label = (key: string) => (t(`mf.plan.feature.${key}`) === `mf.plan.feature.${key}` ? key.replace(/[_.]+/g, " ") : t(`mf.plan.feature.${key}`));
  const locked = f.items.some((i) => i.mode === "unavailable");
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <View style={s.flex}>
          <Text variant="caption" tone="gray">{t("mf.plan.title")}</Text>
          <Text variant="h4">{name || t("mf.plan.unnamed")}</Text>
        </View>
        {f.planVersion != null ? <Pill label={t("mf.plan.version", { n: f.planVersion })} tone="gray" small /> : null}
      </View>
      <Text variant="caption" tone="gray">{t("mf.plan.fixed")}</Text>
      {ask ? (
        <View style={[s.consent, { backgroundColor: c.warnBg }]}>
          <Text variant="small" weight="bold">{t("mf.plan.changedTitle")}</Text>
          <Text variant="small" tone="gray">{t("mf.plan.changedText")}</Text>
          <View style={s.row}>
            <Button title={t("mf.plan.stop")} variant="line" size="sm" disabled={!!busy} loading={busy === "stop"} onPress={() => void run("stop")} style={s.flex} />
            <Button title={t("mf.plan.consent")} variant="gradient" size="sm" disabled={!!busy} loading={busy === "consent"} onPress={() => void run("consent")} style={s.flex} />
          </View>
        </View>
      ) : null}
      {f.items.map((i) => <FeatureRow key={i.key} f={i} label={label(i.key)} locale={locale} />)}
      {locked && onUpgrade ? <Button title={t("mf.plan.upgrade")} icon="arrow-up-circle" variant="soft" size="sm" onPress={onUpgrade} style={s.center} /> : null}
    </Card>
  );
}

function FeatureRow({ f, label, locale }: { f: PlanFeature; label: string; locale: string }) {
  const c = useColors();
  const { t } = useT();
  const off = f.mode === "unavailable";
  const share = f.mode === "limited" && f.limit ? Math.max(0, Math.min(1, (f.used ?? 0) / f.limit)) : null;
  const value = off ? t("mf.plan.unavailable") : f.mode === "unlimited" ? t("mf.plan.unlimited") : f.limit != null ? t("mf.plan.used", { used: f.used ?? 0, limit: f.limit }) : f.remaining != null ? t("mf.plan.remaining", { n: f.remaining }) : t("mf.plan.limited");
  return (
    <View style={[s.feature, { borderTopColor: c.line }]}>
      <View style={s.row}>
        <Icon name={off ? "lock" : f.mode === "unlimited" ? "check-circle" : "bar-chart-2"} size={16} color={off ? c.gray : f.mode === "unlimited" ? c.ok : c.accent} />
        <Text variant="small" weight="semibold" tone={off ? "gray" : "ink"} style={s.flex}>{label}</Text>
        <Text variant="caption" weight="semibold" tone={off ? "gray" : f.mode === "unlimited" ? "ok" : "accent"}>{value}</Text>
      </View>
      {share != null ? <View style={[s.track, { backgroundColor: c.surface2 }]}><View style={[s.bar, { width: `${share * 100}%`, backgroundColor: share >= 1 ? c.err : c.accent }]} /></View> : null}
      {f.mode === "limited" && (f.remaining != null || f.resetsAt) ? (
        <Text variant="caption" tone="gray2">{[f.remaining != null && f.limit != null ? t("mf.plan.remaining", { n: f.remaining }) : "", f.resetsAt ? t("mf.plan.resets", { date: fmtDate(f.resetsAt, locale) }) : ""].filter(Boolean).join(" · ")}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  consent: { gap: 8, padding: 12, borderRadius: 16 },
  feature: { gap: 6, paddingTop: 10, borderTopWidth: 1 },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  bar: { height: 6, borderRadius: 3 },
  center: { alignSelf: "center" },
});
