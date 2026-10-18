import { View } from "react-native";
import { useRouter } from "expo-router";
import { PaymentRowCard, usePayments } from "@/entities/payment";
import { EmptyState, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Subscription payments only (kind "subscription_plan", or the older "subscription").
export function BillingHistory() {
  const { t } = useT();
  const router = useRouter();
  const q = usePayments();
  const rows = (q.data ?? []).filter((p) => !p.kind || p.kind === "subscription" || p.kind === "subscription_plan");
  return (
    <View style={{ gap: 10 }}>
      <Text variant="h3">{t("cs.bill")}</Text>
      {q.isLoading ? <Skeleton height={64} round={16} /> : rows.length ? rows.map((p) => <PaymentRowCard key={p.id} item={p} onPress={() => router.push(`/payments/${p.id}`)} />) : <EmptyState icon="credit-card" title={t("cs.billEmpty")} text={t("cs.billEmptyText")} />}
    </View>
  );
}
