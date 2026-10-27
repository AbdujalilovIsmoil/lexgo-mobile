import { StyleSheet, View } from "react-native";
import { brand, useColors } from "@/shared/theme";
import { Button, Card, Pill, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { BillingPeriod } from "../model/period";
import type { Plan } from "../model/types";
import { PlanFeatures } from "./PlanFeatures";
import { PlanMeta } from "./PlanMeta";
import { PlanPrice } from "./PlanPrice";

type Props = { plan: Plan; period: BillingPeriod; featured?: boolean; active?: boolean; selected?: boolean; onChoose: () => void; onDetails?: () => void; ctaLabel?: string };

// Tariff card: name, price for the chosen period, the backend's feature list, buy button. Without a `ctaLabel` the whole card is
// the choice (a picker that has its own confirm button below): tap it, and `selected` marks it.
export function PlanCard({ plan, period, featured, active, selected, onChoose, onDetails, ctaLabel }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <Card onPress={ctaLabel ? undefined : onChoose} elevated={featured || selected} style={[s.card, (featured || selected) && { borderColor: brand.b600, borderWidth: 2 }]}>
      <View style={s.head}>
        <Text variant="h3" style={s.name}>{plan.name}</Text>
        {active ? <Pill label={t("py3.active")} tone="ok" icon="check" small /> : selected ? <Pill label={t("tgp.aiPick")} tone="ok" icon="check" small /> : featured ? <Pill label={t("plans.mostChosen")} tone="cy" icon="star" small /> : null}
      </View>
      {plan.description ? <Text variant="small" tone="gray">{plan.description}</Text> : null}
      <PlanPrice plan={plan} period={period} />
      <PlanMeta plan={plan} />
      <View style={[s.features, { borderTopColor: c.line }]}>
        <PlanFeatures items={plan.features} limit={6} />
        {onDetails ? (
          <PressableScale onPress={onDetails} hitSlop={8}><Text variant="small" weight="bold" tone="accent">{t("py3.details")}</Text></PressableScale>
        ) : null}
      </View>
      {ctaLabel ? <Button title={ctaLabel} onPress={onChoose} variant={featured ? "gradient" : "soft"} full icon="arrow-right" iconRight /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 20 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flex: 1 },
  features: { borderTopWidth: 1, paddingTop: 14, gap: 12, marginTop: 4, marginBottom: 6 },
});
