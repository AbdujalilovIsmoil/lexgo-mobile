import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, EmptyState, Skeleton, Text, PressableScale } from "@/shared/ui";
import { useOpenCases } from "@/entities/open-cases";
import { useT } from "@/shared/i18n";
import { RequestRow } from "./RequestRow";

// .ppanel "Faol so'rovlaringiz": open cases from GET /cases, "Barchasini ko'rish" opens the full list.
export function DashRequests() {
  const { t } = useT();
  const router = useRouter();
  const { open, isLoading } = useOpenCases();
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="h4">{t("cdash.requests")}</Text>
        <PressableScale onPress={() => router.navigate("/(tabs)/works")} hitSlop={8}><Text variant="small" weight="semibold" tone="accent">{t("cdash.viewAll")}</Text></PressableScale>
      </View>
      {isLoading ? <Skeleton height={64} style={s.sk} /> : !open.length ? (
        <EmptyState icon="star" title={t("cdash.emptyTitle")} text={t("cdash.emptyText")} />
      ) : open.map((c, i) => <RequestRow key={c.id} c={c} last={i === open.length - 1} />)}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 16 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  sk: { marginTop: 8 },
});
