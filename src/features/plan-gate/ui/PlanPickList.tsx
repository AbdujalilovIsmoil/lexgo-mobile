import { View } from "react-native";
import { PlanCard, type BillingPeriod, type Plan } from "@/entities/plan";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { plans: Plan[]; period: BillingPeriod; picked: string; onPick: (id: string) => void };

// Tariff cards to choose from (the same card as the tariffs page); the picked one is highlighted.
export function PlanPickList({ plans, period, picked, onPick }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 12 }}>
      <Text variant="small" tone="gray">{t("tgp.mdPlan")}</Text>
      {plans.map((p) => <PlanCard key={p.id} plan={p} period={period} featured={p.id === picked} ctaLabel={t(p.id === picked ? "tgp.mdPicked" : "tgp.mdPick")} onChoose={() => onPick(p.id)} />)}
    </View>
  );
}
