import { StyleSheet, View } from "react-native";
import { CampaignLine, PERIOD_KEY, usePlanQuote, type BillingPeriod, type Plan } from "@/entities/plan";
import { GradientBox, Icon, PressableScale, Skeleton, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// The plan being requested on a navy gradient card: its name, the Telegram badge and what the request will charge for the chosen period —
// the backend's quote (TZ.md "Subscription plan quote"), with a running campaign under it. The caption names the period, so "849 300" is
// never mistaken for a monthly price.
export function RequestPlanCard({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const { t } = useT();
  const q = usePlanQuote(plan.id, period, plan.monthlyPrice > 0);
  return (
    <GradientBox variant="dark" round={22} style={s.card}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.top}>
        <Text variant="h4" tone="white" numberOfLines={2} style={s.name}>{plan.name}</Text>
        <View style={s.tg}><Icon name="send" size={13} color="#00CFE8" /><Text variant="caption" weight="bold" style={s.tgTx}>Telegram</Text></View>
      </View>
      <Text variant="caption" style={s.cap}>{t("ntd.tgPay")} · {t(PERIOD_KEY[period])}</Text>
      {plan.monthlyPrice <= 0 ? <Text variant="hx" tone="white">{t("cs.free")}</Text> : q.isPending ? <Skeleton width="60%" height={34} round={10} onDark style={s.gap} /> : q.data ? (
        <>
          <View style={s.amount}>
            <Text variant="hx" tone="white" numberOfLines={1} adjustsFontSizeToFit>{fmtMoney(q.data.amount)}</Text>
            <Text variant="small" style={s.cur}>{t("common.currency")}</Text>
          </View>
          {q.data.discount > 0 ? <CampaignLine quote={q.data} onDark /> : null}
        </>
      ) : (
        <PressableScale onPress={() => void q.refetch()} accessibilityRole="button" hitSlop={8} style={[s.amount, s.gap]}>
          <Text variant="small" style={s.cur}>{t("subq.price.failed")}</Text>
          <Text variant="small" weight="bold" tone="white">{t("common.retry")}</Text>
        </PressableScale>
      )}
    </GradientBox>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, gap: 4 },
  glow: { position: "absolute", top: -70, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(0,207,232,0.22)" },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  name: { flex: 1 },
  tg: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tgTx: { color: "#CFE9FF" },
  cap: { color: "#9FD4FF", marginTop: 8 },
  amount: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  cur: { color: "#C4DEFF" },
  gap: { marginTop: 4 },
});
