import { StyleSheet, View } from "react-native";
import { Pill, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import type { PlanQuote } from "../api/quoteApi";
import type { BillingPeriod } from "../model/period";
import { usePlanQuote } from "../model/queries";
import type { Plan } from "../model/types";

export const PERIOD_KEY: Record<BillingPeriod, string> = { monthly: "plans.term1", six_month: "plans.term6", yearly: "plans.term12", prepaid_yearly: "py3.prepaid" };

// Under a running campaign: the base crossed out, the discount and the campaign's name with its end date — all from the quote.
export function CampaignLine({ quote, onDark }: { quote: PlanQuote; onDark?: boolean }) {
  const { t, locale } = useT();
  const c = quote.campaign;
  const name = [c?.title || t("subq.price.promo"), c?.endsAt ? t("subq.price.until", { date: fmtDate(c.endsAt, locale) }) : ""].filter(Boolean).join(" · ");
  return (
    <View style={s.promo}>
      <View style={s.row}>
        <Text variant="small" tone="gray2" style={[s.was, onDark && s.wasDark]}>{fmtMoney(quote.base)}</Text>
        <Pill label={t("subq.price.off", { sum: `${fmtMoney(quote.discount)} ${t("common.currency")}` })} tone={onDark ? "glass" : "ok"} icon="tag" small />
      </View>
      <Text variant="caption" tone="gray" style={onDark && s.nameDark} numberOfLines={2}>{name}</Text>
    </View>
  );
}

// The price of a plan for a billing period exactly as GET /subscription-plans/{id}/quote gives it (TZ.md "Subscription plan quote"): the amount
// to pay, and under a campaign what it is taken off. Nothing is worked out on the phone; while the quote loads a placeholder keeps the place.
export function PlanPrice({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const { t } = useT();
  const free = plan.monthlyPrice <= 0;
  const q = usePlanQuote(plan.id, period, !free);
  if (free) return <Text variant="hx" tone="accent" style={s.price}>{t("cs.free")}</Text>;
  if (q.isPending) return <Skeleton width="62%" height={34} round={10} style={s.top} />;
  if (!q.data) {
    return (
      <PressableScale onPress={() => void q.refetch()} accessibilityRole="button" hitSlop={8} style={[s.row, s.top]}>
        <Text variant="small" tone="gray">{t("subq.price.failed")}</Text>
        <Text variant="small" weight="bold" tone="accent">{t("common.retry")}</Text>
      </PressableScale>
    );
  }
  return (
    <View style={s.col}>
      <View style={s.row}>
        <Text variant="hx" tone="accent" style={s.price}>{fmtMoney(q.data.amount)}</Text>
        <Text variant="small" tone="gray">{t(`subq.price.${period}`)}</Text>
      </View>
      {q.data.discount > 0 ? <CampaignLine quote={q.data} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 6, marginTop: 4 },
  top: { marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  price: { fontSize: 30, lineHeight: 34 },
  promo: { gap: 4 },
  was: { textDecorationLine: "line-through" },
  wasDark: { color: "#9FB7D6" },
  nameDark: { color: "#C4DEFF" },
});
