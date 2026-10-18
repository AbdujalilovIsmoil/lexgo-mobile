import { View } from "react-native";
import { aiLimit, aiPricing, FEATURED_SLUG, PlanFeatures, type Plan, type Term } from "@/entities/plan";
import { brand } from "@/shared/theme";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { plan: Plan; term: Term; upfront: boolean; featured: boolean; current: boolean; onChoose: () => void };

// One LexGo.AI tariff: price per month for the chosen term, the term total, features, buy button.
export function AiPlanCard({ plan, term, upfront, featured, current, onChoose }: Props) {
  const { t } = useT();
  const free = plan.monthlyPrice === 0;
  const pr = aiPricing(plan, term, upfront);
  const limit = aiLimit(plan);
  return (
    <Card elevated={featured} style={[{ gap: 10, padding: 20 }, featured && { borderColor: brand.b600, borderWidth: 2 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="h3" style={{ flex: 1 }}>{plan.name}</Text>
        {current ? <Pill label={t("cs.cur")} tone="ok" icon="check" small /> : featured ? <Pill label={t("cs.rec")} tone="cy" icon="star" small /> : null}
        {pr.savePct > 0 && !free ? <Pill label={`−${pr.savePct}%`} tone="ok" small /> : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
        <Text variant="hx" tone="accent">{free ? t("cs.free") : fmtMoney(pr.perMonth)}</Text>
        {free ? null : <Text variant="small" tone="gray">{t("cs.perMonth")}</Text>}
      </View>
      {!free && term > 1 ? <Text variant="caption" tone="gray">{t("cs.total", { term: upfront ? 12 : term, total: fmtMoney(pr.total) })}</Text> : null}
      {!free && pr.savePct > 0 ? <Text variant="caption" tone="gray2" style={{ textDecorationLine: "line-through" }}>{t("ntd.wasMonthly", { price: fmtMoney(plan.monthlyPrice) })}</Text> : null}
      {free && limit ? <Text variant="caption" tone="gray">{t("cs.usage", { used: 0, limit })}</Text> : null}
      <PlanFeatures items={plan.features} limit={6} />
      {current ? <Button title={t("cs.cur")} icon="check" variant="soft" full disabled /> : free ? <Button title={t("cs.included")} variant="line" full disabled /> : <Button title={t("cs.choose")} icon={plan.slug === FEATURED_SLUG ? "award" : undefined} variant={featured ? "gradient" : "line"} full onPress={onChoose} />}
    </Card>
  );
}
