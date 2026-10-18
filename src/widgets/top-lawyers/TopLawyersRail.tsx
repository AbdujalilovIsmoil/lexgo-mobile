import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LawyerCard, LawyerCardSkeleton, useLawyers } from "@/entities/lawyer";
import { SectionHeader } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Home rail: first six lawyers in the backend's recommended order.
export function TopLawyersRail() {
  const { t } = useT();
  const router = useRouter();
  const { data, isLoading } = useLawyers();
  const rows = (data ?? []).slice(0, 6);
  if (!isLoading && !rows.length) return null;
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <SectionHeader title={t("home.topLawyers")} actionLabel={t("common.seeAll")} onAction={() => router.push("/(tabs)/lawyers")} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {isLoading
          ? [0, 1].map((i) => <LawyerCardSkeleton key={i} compact />)
          : rows.map((l) => <LawyerCard key={l.id} lawyer={l} compact onPress={() => router.push({ pathname: "/specialist/[id]", params: { id: l.userId || l.id } })} />)}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 28 },
  head: { paddingHorizontal: 16 },
  row: { paddingHorizontal: 16, gap: 12 },
});
