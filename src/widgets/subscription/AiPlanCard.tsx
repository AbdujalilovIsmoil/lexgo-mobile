import { View } from "react-native";
import { FEATURED_SLUG, PlanFeatures, PlanPrice, termPeriod, useFeature, type Plan, type Term } from "@/entities/plan";
import { brand } from "@/shared/theme";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { usePlanRa } from "./usePlanRa";

type Props = { plan: Plan; term: Term; upfront: boolean; featured: boolean; current: boolean; onChoose: () => void };

// One LexGo.AI tariff: the backend's quote for the chosen term (a running campaign shows on it), features, buy button. On the client's
// current tariff the AI counter is the backend's own (used / limit), never a number kept on the phone.
export function AiPlanCard({ plan, term, upfront, featured, current, onChoose }: Props) {
  const { t } = useT();
  const free = plan.monthlyPrice === 0;
  const ai = useFeature("ai_requests");
  const usage = current && ai?.mode === "limited" && ai.limit !== null ? { used: ai.used ?? 0, limit: ai.limit } : null;
  const ra = usePlanRa(plan, current, free);
  return (
    <View {...ra.card}>
      <Card elevated={featured} style={[{ gap: 10, padding: 20 }, featured && { borderColor: brand.b600, borderWidth: 2 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text variant="h3" style={{ flex: 1 }}>{plan.name}</Text>
          {current ? <Pill label={t("cs.cur")} tone="ok" icon="check" small /> : featured ? <Pill label={t("cs.rec")} tone="cy" icon="star" small /> : null}
        </View>
        <PlanPrice plan={plan} period={termPeriod(term, upfront)} />
        {usage ? <Text variant="caption" tone="gray">{t("cs.usage", usage)}</Text> : null}
        <PlanFeatures items={plan.features} limit={6} />
        <View {...ra.choose}>
          {current ? <Button title={t("cs.cur")} icon="check" variant="soft" full disabled /> : free ? <Button title={t("cs.included")} variant="line" full disabled /> : <Button title={t("cs.choose")} icon={plan.slug === FEATURED_SLUG ? "award" : undefined} variant={featured ? "gradient" : "line"} full onPress={onChoose} />}
        </View>
      </Card>
    </View>
  );
}
