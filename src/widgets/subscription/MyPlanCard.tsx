import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { acceptRenewal, FeatureRow, featureKeys, gateOfFeature, setAutoRenew, TermList, useContract, useEntitlements, useFeatureLabel, useMyFeatures, usePlans, type ContractVersion } from "@/entities/plan";
import { Button, Card, Pill, Text, toast } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

type Props = { onUpgrade?: () => void }; // "choose a plan" when a feature is locked or used up (not shown on the plans page itself)

// TZ.md §13 "My plan": the features of the current paid period as the backend reports them — locked (with the way to another plan), a
// counter with what is left and when it resets, or unlimited. When the backend marks the subscription `renewal_consent_required` (or the
// tariff's terms changed and no consent is on record) the new terms are listed against today's before the client agrees to them or turns
// renewal off; the current period keeps its own snapshot either way.
export function MyPlanCard({ onUpgrade }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const qc = useQueryClient();
  const f = useMyFeatures().data;
  const contract = useContract(f?.subscriptionId ?? "");
  const plans = usePlans().data;
  const subs = useEntitlements().data?.subs;
  const label = useFeatureLabel();
  const [busy, setBusy] = useState<"" | "consent" | "stop">("");
  const [answered, setAnswered] = useState<"" | "consent" | "stop">("");
  if (!f || (!f.subscriptionId && !f.items.length)) return null;
  const k = contract.data;
  const subId = k?.subscriptionId || f.subscriptionId;
  const name = k ? k.names[locale] || k.names.uz || k.title : "";
  const ask = !!subId && (f.consentRequired || !!k?.consentRequired || !!k?.termsChanged) && k?.consentAccepted !== true && !answered;
  // What the next period brings: the contract's own newer version, else the tariff as published now (the version a renewal captures) when
  // it is not the version already bought.
  const planId = k?.planId || f.planId || subs?.find((x) => x.id === subId)?.planId || "";
  const live = planId ? plans?.find((p) => p.id === planId) : undefined;
  const newer = live && live.contract.length && (k?.version == null || live.version !== k.version) ? live : null;
  const next: ContractVersion | null = k?.next ?? (newer ? { version: newer.version, terms: newer.contract, prices: {} } : null);
  const nextPrice = next && k?.billingPeriod ? next.prices[k.billingPeriod] : undefined;
  const run = async (kind: "consent" | "stop") => {
    if (!subId || busy) return;
    setBusy(kind);
    try {
      if (kind === "consent") await acceptRenewal(subId);
      else await setAutoRenew(subId, false);
      successHaptic();
      setAnswered(kind);
      toast(t(kind === "consent" ? "mf.plan.consentDone" : "mf.plan.stopDone"), "ok");
      void qc.invalidateQueries({ queryKey: featureKeys.contract(subId) });
      void qc.invalidateQueries({ queryKey: featureKeys.mine });
    } catch {
      errorHaptic();
      toast(t(kind === "consent" ? "mf.plan.consentFailed" : "mf.plan.stopFailed"), "err");
    } finally {
      setBusy("");
    }
  };
  const stopped = f.items.some((i) => gateOfFeature(i, i.key));
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <View style={s.flex}>
          <Text variant="caption" tone="gray">{t("mf.plan.title")}</Text>
          <Text variant="h4">{name || live?.name || t("mf.plan.unnamed")}</Text>
        </View>
        {f.planVersion !== null ? <Pill label={t("mf.plan.version", { n: f.planVersion })} tone="gray" small /> : null}
      </View>
      <Text variant="caption" tone="gray">{t("mf.plan.fixed")}</Text>
      {ask ? (
        <View style={[s.consent, { backgroundColor: c.warnBg }]}>
          <Text variant="small" weight="bold">{t("mf.plan.changedTitle")}</Text>
          <Text variant="small" tone="gray">{t("mf.plan.changedText")}</Text>
          {next?.terms.length ? (
            <View style={[s.terms, { backgroundColor: c.surface }]}>
              <Text variant="caption" weight="semibold" tone="gray">{next.version !== null ? t("subq.contract.nextV", { n: next.version }) : t("subq.contract.next")}</Text>
              <TermList terms={next.terms} before={k?.terms.length ? k.terms : undefined} />
            </View>
          ) : null}
          {nextPrice ? <Text variant="small" weight="semibold">{t("subq.contract.price", { sum: `${fmtMoney(nextPrice)} ${t("common.currency")}` })}</Text> : null}
          <View style={s.row}>
            <Button title={t("mf.plan.stop")} variant="line" size="sm" disabled={!!busy} loading={busy === "stop"} onPress={() => void run("stop")} style={s.flex} />
            <Button title={t("mf.plan.consent")} variant="gradient" size="sm" disabled={!!busy} loading={busy === "consent"} onPress={() => void run("consent")} style={s.flex} />
          </View>
        </View>
      ) : null}
      {f.items.map((i) => <FeatureRow key={i.key} f={i} label={label(i.key)} />)}
      {stopped && onUpgrade ? <Button title={t("mf.plan.upgrade")} icon="arrow-up-circle" variant="soft" size="sm" onPress={onUpgrade} style={s.center} /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  consent: { gap: 8, padding: 12, borderRadius: 16 },
  terms: { gap: 10, padding: 12, borderRadius: 12 },
  center: { alignSelf: "center" },
});
