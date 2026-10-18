import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { WorkRow, WorkRowSkeleton, isOpenWork, useWorks } from "@/entities/work";
import { Card, ErrorView, Icon, SectionHeader, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Home: the three most recently changed unfinished works, straight from GET /clients/me/works.
export function HomeWorks() {
  const { t } = useT();
  const router = useRouter();
  const works = useWorks();
  const open = works.items.filter((w) => isOpenWork(w.status)).slice(0, 3);
  return (
    <View style={s.wrap}>
      <SectionHeader title={t("cl6.works.title")} actionLabel={t("common.seeAll")} onAction={() => router.navigate("/(tabs)/works")} />
      {works.isLoading ? <WorkRowSkeleton count={2} /> : works.isError && !works.items.length ? (
        <ErrorView error={works.error} onRetry={() => void works.refetch()} compact />
      ) : open.length ? (
        <View style={s.list}>
          {open.map((w) => <WorkRow key={w.id || w.workId} work={w} onPress={() => router.push({ pathname: "/works/[id]", params: { id: w.workId || w.id } })} />)}
        </View>
      ) : (
        <Card tinted style={s.empty} onPress={() => router.navigate("/(tabs)/services")}>
          <Icon name="briefcase" size={22} tone="accent" />
          <Text variant="small" tone="gray" style={s.text}>{t("cl6.works.none")}</Text>
          <Icon name="chevron-right" size={18} tone="gray" />
        </Card>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 26 },
  list: { gap: 10 },
  empty: { flexDirection: "row", alignItems: "center", gap: 12 },
  text: { flex: 1 },
});
