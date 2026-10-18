import { View } from "react-native";
import { useRouter } from "expo-router";
import { isGiftPlan, PlanFeatures, type Plan } from "@/entities/plan";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The gift tariff is bought for someone else on the Gifts page (web: .splan--gift).
export function GiftPlanCard({ plans }: { plans: Plan[] }) {
  const { t } = useT();
  const router = useRouter();
  const gift = plans.find(isGiftPlan);
  const feats = gift?.features.length ? gift.features : [1, 2, 3, 4].map((n) => t(`cs.giftF${n}`));
  return (
    <Card style={{ gap: 10, padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="gift" size={18} tone="accent" />
        <Text variant="h3">{gift?.name || t("cs.giftName")}</Text>
      </View>
      <Text variant="small" tone="gray">{t("cs.giftNote")}</Text>
      <PlanFeatures items={feats} />
      <Button title={t("cs.giftCta")} variant="line" full onPress={() => router.push("/profile/gifts")} />
    </Card>
  );
}
