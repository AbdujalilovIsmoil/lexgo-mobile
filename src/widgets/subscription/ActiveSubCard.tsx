import { StyleSheet, View } from "react-native";
import { TermList, useContract, type ActiveSub, type Plan } from "@/entities/plan";
import { useAutoRenew } from "@/features/choose-plan";
import { ProgressBar, SwitchField } from "@/shared/ui/admin";
import { Card, Pill, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useNow } from "@/shared/lib/pay/useNow";
import { useT } from "@/shared/i18n";

// One active subscription: plan, dates, how much of the term is gone, what it gives and the auto-renew switch. What it gives is the
// contract snapshot bought for this period (GET /subscriptions/{id}/contract), not the tariff as it is sold today — a later edit of the
// tariff does not change a running period. Without a snapshot nothing is listed (the features above still show the live state).
export function ActiveSubCard({ sub, plan }: { sub: ActiveSub; plan?: Plan }) {
  const { t, locale } = useT();
  const auto = useAutoRenew(sub.id);
  const k = useContract(sub.id).data;
  const now = useNow(false);
  const from = Date.parse(sub.startsAt);
  const to = Date.parse(sub.endsAt);
  const days = Number.isFinite(to) ? Math.max(0, Math.ceil((to - now) / 86_400_000)) : 0;
  const used = Number.isFinite(from) && to > from ? Math.min(1, Math.max(0, (now - from) / (to - from))) : 0;
  const name = (k && (k.names[locale] || k.names.uz || k.title)) || plan?.name || t("py4.planFallback");
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="h4" style={s.name}>{name}</Text>
        <Pill label={t("py4.daysLeft", { n: days })} tone={days <= 5 ? "warn" : "ok"} small />
      </View>
      <Text variant="caption" tone="gray">{fmtDate(sub.startsAt, locale)} → {fmtDate(sub.endsAt, locale)}{sub.familyCount ? ` · ${t("py4.family", { n: sub.familyCount })}` : ""}</Text>
      <ProgressBar value={used} />
      {k?.terms.length ? (
        <View style={s.terms}>
          <Text variant="caption" weight="semibold" tone="gray">{k.version !== null ? `${t("subq.contract.now")} · ${t("mf.plan.version", { n: k.version })}` : t("subq.contract.now")}</Text>
          <TermList terms={k.terms} />
        </View>
      ) : null}
      <SwitchField label={t("py3.auto.title")} hint={auto.known ? undefined : t("py4.autoUnknown")} value={auto.value} onChange={(on) => auto.set(on)} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1 },
  terms: { gap: 10 },
});
