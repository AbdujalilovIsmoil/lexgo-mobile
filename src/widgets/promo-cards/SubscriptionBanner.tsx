import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useEntitlements } from "@/entities/plan";
import { Button, GradientBox, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Gradient CTA card → subscription plans (hidden while the client has an active plan).
export function SubscriptionBanner() {
  const { t } = useT();
  const router = useRouter();
  const { data } = useEntitlements();
  if (data?.active) return null;
  return (
    <GradientBox style={s.box}>
      <View style={s.icon}>
        <Icon name="credit-card" size={22} tone="white" />
      </View>
      <Text variant="h3" tone="white">
        {t("home.subscriptionTitle")}
      </Text>
      <Text variant="small" style={s.sub}>
        {t("home.subscriptionSub")}
      </Text>
      <Button title={t("home.subscriptionCta")} onPress={() => router.push("/subscription")} variant="glass" size="sm" icon="arrow-right" iconRight style={s.btn} />
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { marginHorizontal: 16, marginTop: 28, padding: 20, gap: 8 },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  sub: { color: "rgba(255,255,255,0.85)" },
  btn: { marginTop: 8 },
});
