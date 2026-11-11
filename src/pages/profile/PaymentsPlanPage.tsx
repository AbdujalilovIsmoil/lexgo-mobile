import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { entitlementKeys, featureKeys } from "@/entities/plan";
import { payKeys } from "@/entities/payment";
import { HistoryTab, PayPlanTabs, SubscriptionTab, type PayPlanTab } from "@/widgets/pay-plan";
import { useClientFrame } from "@/widgets/client-dash";
import { AdminPage } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Profil → "To'lovlar va obuna": two tabs pinned under the header — "Obuna" (the current plan, its limits and the other packages) and
// "To'lovlar tarixi" (totals, categories, search and the list). On iOS the "Obuna" tab only shows the plan the person has and its limits.
// `?tab=history` opens the second tab.
export function PaymentsPlanPage() {
  const { t } = useT();
  const c = useColors();
  const frame = useClientFrame();
  const insets = useInsets();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<PayPlanTab>(params.tab === "history" ? "history" : "plan");
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    const keys = tab === "plan" ? [entitlementKeys.all, featureKeys.mine, ["plans"]] : [payKeys.list];
    await Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey: [...queryKey] }))).finally(() => setRefreshing(false));
  };
  return (
    <AdminPage {...frame} title={t("profile.pp.payPlan")} subtitle={t("pps.sub")}>
      <View style={s.tabs}><PayPlanTabs value={tab} onChange={setTab} /></View>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={c.accent} colors={[c.accent]} />}
        contentContainerStyle={{ padding: 16, paddingTop: 6, paddingBottom: insets.bottom + 32 }}>
        {tab === "plan" ? <SubscriptionTab /> : <HistoryTab />}
      </ScrollView>
    </AdminPage>
  );
}

const s = StyleSheet.create({
  tabs: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
});
