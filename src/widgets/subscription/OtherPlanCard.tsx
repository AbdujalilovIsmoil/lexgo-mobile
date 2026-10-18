import { View } from "react-native";
import { otherPricing, PlanFeatures, type Plan } from "@/entities/plan";
import { brand } from "@/shared/theme";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { plan: Plan; term: 6 | 12; upfront: boolean; featured: boolean; current: boolean; onChoose: () => void };

// A non-AI tariff for the chosen 6 / 12 month term (web: .splan).
export function OtherPlanCard({ plan, term, upfront, featured, current, onChoose }: Props) {
  const { t } = useT();
  const pr = otherPricing(plan, term, upfront);
  return (
    <Card elevated={featured} style={[{ gap: 10, padding: 20 }, featured && { borderColor: brand.b600, borderWidth: 2 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="h3" style={{ flex: 1 }}>{plan.name}</Text>
        {current ? <Pill label={t("cs.cur")} tone="ok" icon="check" small /> : null}
        {pr.savePct > 0 ? <Pill label={`−${pr.savePct}%`} tone="ok" small /> : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
        <Text variant="hx" tone="accent">{fmtMoney(pr.perMonth)}</Text>
        <Text variant="small" tone="gray">{t("cs.perMonth")}</Text>
      </View>
      <Text variant="caption" tone="gray">{t("cs.total", { term, total: fmtMoney(pr.total) })}</Text>
      {pr.savePct > 0 ? <Text variant="caption" tone="gray2" style={{ textDecorationLine: "line-through" }}>{t("ntd.wasMonthly", { price: fmtMoney(plan.monthlyPrice) })}</Text> : null}
      <PlanFeatures items={plan.features} limit={6} />
      {current ? <Button title={t("cs.cur")} icon="check" variant="soft" full disabled /> : <Button title={t("cs.choose")} icon={featured ? "award" : undefined} variant={featured ? "gradient" : "line"} full onPress={onChoose} />}
    </Card>
  );
}
