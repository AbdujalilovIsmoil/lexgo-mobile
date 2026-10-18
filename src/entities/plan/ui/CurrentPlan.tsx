import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/shared/theme";
import { Card, Icon, Pill, Skeleton, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { useEntitlements } from "../model/queries";

// Current subscription of the signed-in client (GET /clients/me/entitlements); taps through
// to the "what my plan gives" page.
export function CurrentPlan() {
  const c = useColors();
  const { t, locale } = useT();
  const router = useRouter();
  const { data, isLoading } = useEntitlements();
  if (isLoading) return <Skeleton height={86} round={20} />;
  if (!data) return null;
  return (
    <Card tinted style={s.card} onPress={() => router.push("/entitlements")}>
      <View style={[s.badge, { backgroundColor: data.active ? c.okBg : c.surface2 }]}><Icon name={data.active ? "check-circle" : "circle"} size={22} color={data.active ? c.ok : c.gray} /></View>
      <View style={s.col}>
        <Text variant="small" tone="gray">{t("subp.current")}</Text>
        <Text variant="h4">{data.active ? `${t("subp.active")} ${fmtDate(data.endsAt, locale)}` : t("subp.noPlan")}</Text>
        {data.pendingRequests ? <Pill label={t("subp.requestPending")} tone="warn" small /> : null}
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 4, alignItems: "flex-start" },
});
