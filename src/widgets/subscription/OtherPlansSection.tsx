import { useState } from "react";
import { View } from "react-native";
import type { Plan } from "@/entities/plan";
import { GiftPlanCard } from "./GiftPlanCard";
import { OtherPlanCard } from "./OtherPlanCard";
import { OtherTermBar } from "./OtherTermBar";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { plans: Plan[]; all: Plan[]; activeIds: string[]; onChoose: (p: Plan, term: 6 | 12, upfront: boolean) => void };

// Every non-AI tariff with a 6 / 12 month switch, the gift card and the rating note.
export function OtherPlansSection({ plans, all, activeIds, onChoose }: Props) {
  const { t } = useT();
  const [term, setTerm] = useState<6 | 12>(6);
  const [upfront, setUpfront] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <Text variant="h2">{t("cs.otherTitle")}</Text>
      <Text variant="small" tone="gray">{t("cs.otherSub")}</Text>
      <OtherTermBar term={term} upfront={upfront} onTerm={setTerm} onUpfront={setUpfront} />
      {plans.map((p, i) => <OtherPlanCard key={p.id} plan={p} term={term} upfront={upfront} featured={i === 1} current={activeIds.includes(p.id)} onChoose={() => onChoose(p, term, upfront)} />)}
      <GiftPlanCard plans={all} />
      <Text variant="caption" tone="gray">{t("cs.rating")}</Text>
    </View>
  );
}
