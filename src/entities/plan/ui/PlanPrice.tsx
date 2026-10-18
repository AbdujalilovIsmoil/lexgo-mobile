import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { planPerMonth, planSavingPct, planTotal, type BillingPeriod } from "../model/period";
import type { Plan } from "../model/types";

export const PERIOD_KEY: Record<BillingPeriod, string> = { monthly: "plans.term1", six_month: "plans.term6", yearly: "plans.term12", prepaid_yearly: "py3.prepaid" };

// Monthly price big, the period total and the saving under it.
export function PlanPrice({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const { t } = useT();
  const saving = planSavingPct(plan, period);
  return (
    <View style={s.col}>
      <View style={s.row}>
        <Text variant="hx" tone="accent" style={s.price}>{fmtMoney(planPerMonth(plan, period))}</Text>
        <Text variant="small" tone="gray">{t("plans.perMonth")}</Text>
      </View>
      {period !== "monthly" ? (
        <View style={s.row}>
          <Text variant="caption" tone="gray">{t("plans.totalFor", { term: t(PERIOD_KEY[period]) })}: {fmtMoney(planTotal(plan, period))} {t("common.currency")}</Text>
          {saving > 0 ? <Pill label={t("plans.youSave", { pct: saving })} tone="ok" small /> : null}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 4, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "baseline", gap: 6, flexWrap: "wrap" },
  price: { fontSize: 30, lineHeight: 34 },
});
