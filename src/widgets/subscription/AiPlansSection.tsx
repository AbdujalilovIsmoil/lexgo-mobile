import { View } from "react-native";
import { FEATURED_SLUG, type Plan, type Term } from "@/entities/plan";
import { AiPlanCard } from "./AiPlanCard";
import { AiTermBar } from "./AiTermBar";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { plans: Plan[]; term: Term; upfront: boolean; activeIds: string[]; onTerm: (t: Term) => void; onUpfront: (v: boolean) => void; onChoose: (p: Plan) => void };

// LexGo.AI: Free / Lite / Pro with the term switch (web: plans__head + plans__grid).
export function AiPlansSection({ plans, term, upfront, activeIds, onTerm, onUpfront, onChoose }: Props) {
  const { t } = useT();
  const hasPro = plans.some((p) => p.slug === FEATURED_SLUG);
  return (
    <View style={{ gap: 12 }}>
      <Text variant="h2">{t("cs.aiTitle")}</Text>
      <Text variant="small" tone="gray">{t("cs.aiSub")}</Text>
      <AiTermBar term={term} upfront={upfront} onTerm={onTerm} onUpfront={onUpfront} />
      {plans.map((p, i) => (
        <AiPlanCard key={p.id} plan={p} term={term} upfront={upfront} current={activeIds.includes(p.id)} featured={hasPro ? p.slug === FEATURED_SLUG : plans.length > 1 && i === plans.length - 1} onChoose={() => onChoose(p)} />
      ))}
      <Text variant="caption" tone="gray">{t("cs.rules")}</Text>
    </View>
  );
}
