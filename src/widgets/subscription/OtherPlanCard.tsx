import { View } from "react-native";
import { PlanFeatures, PlanPrice, termPeriod, type Plan } from "@/entities/plan";
import { brand } from "@/shared/theme";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { usePlanRa } from "./usePlanRa";

type Props = { plan: Plan; term: 6 | 12; upfront: boolean; featured: boolean; current: boolean; onChoose: () => void };

// A non-AI tariff for the chosen 6 / 12 month term (web: .splan), priced by the backend's quote for that term.
export function OtherPlanCard({ plan, term, upfront, featured, current, onChoose }: Props) {
  const { t } = useT();
  const ra = usePlanRa(plan, current, false);
  return (
    <View {...ra.card}>
      <Card elevated={featured} style={[{ gap: 10, padding: 20 }, featured && { borderColor: brand.b600, borderWidth: 2 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text variant="h3" style={{ flex: 1 }}>{plan.name}</Text>
          {current ? <Pill label={t("cs.cur")} tone="ok" icon="check" small /> : null}
        </View>
        <PlanPrice plan={plan} period={termPeriod(term, upfront)} />
        <PlanFeatures items={plan.features} limit={6} />
        <View {...ra.choose}>
          {current ? <Button title={t("cs.cur")} icon="check" variant="soft" full disabled /> : <Button title={t("cs.choose")} icon={featured ? "award" : undefined} variant={featured ? "gradient" : "line"} full onPress={onChoose} />}
        </View>
      </Card>
    </View>
  );
}
