import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { PlanCard, type BillingPeriod, type Plan } from "@/entities/plan";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { plans: Plan[]; other: Plan[]; gift: boolean; period: BillingPeriod; activeIds: string[]; authed: boolean; onChoose: (p: Plan) => void; onDetails: (p: Plan) => void };

// Tariff cards for the client (the middle one featured), then the other tariffs on request,
// then the gift entry. What each card lists is exactly what the backend returned.
export function PlanList({ plans, other, gift, period, activeIds, authed, onChoose, onDetails }: Props) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const [more, setMore] = useState(false);
  const cta = authed ? t("plans.choose") : t("plans.chooseLogin");
  const card = (p: Plan, i = -1) => <PlanCard key={p.id} plan={p} period={period} featured={i === 1 || (plans.length === 1 && i === 0)} active={activeIds.includes(p.id)} onChoose={() => onChoose(p)} onDetails={() => onDetails(p)} ctaLabel={cta} />;
  return (
    <View style={{ gap: 14 }}>
      {plans.map((p, i) => card(p, i))}
      {other.length ? <Button title={t(more ? "py3.other.hide" : "py3.other.show", { n: other.length })} variant="line" icon={more ? "chevron-up" : "chevron-down"} full onPress={() => setMore((v) => !v)} /> : null}
      {more ? other.map((p) => card(p)) : null}
      {gift ? (
        <Card tinted onPress={() => router.push("/profile/gifts")} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Icon name="gift" size={22} color={c.accent} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="h4">{t("plans.gift")}</Text>
            <Text variant="small" tone="gray">{t("plans.giftSub")}</Text>
          </View>
          <Icon name="chevron-right" size={18} tone="gray" />
        </Card>
      ) : null}
    </View>
  );
}
