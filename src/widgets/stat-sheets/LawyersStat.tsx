import { View } from "react-native";
import { useRouter } from "expo-router";
import { useLawyerPage } from "@/entities/lawyer";
import { Avatar, Button, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Tiles } from "./Tiles";

// Real counts from the marketplace plus the three best-rated specialists.
export function LawyersStat({ go }: { go: (fn: () => void) => void }) {
  const { t } = useT();
  const router = useRouter();
  const { data } = useLawyerPage();
  if (!data) return <View style={{ gap: 12 }}><Skeleton height={84} round={18} /><Skeleton height={56} /><Skeleton height={56} /></View>;
  const items = data.items;
  const top = [...items].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 3);
  return (
    <View style={{ gap: 16 }}>
      <Tiles items={[{ value: data.total, label: t("stats.lawyers.total") }, { value: items.filter((l) => l.kind === "advocate").length, label: t("stats.lawyers.advocates") }, { value: items.filter((l) => l.kind === "lawyer").length, label: t("stats.lawyers.lawyers") }]} />
      <Text variant="h4">{t("stats.lawyers.top")}</Text>
      {top.map((l) => (
        <PressableScale key={l.id} scale={0.985} onPress={() => go(() => router.push({ pathname: "/specialist/[id]", params: { id: l.userId || l.id } }))} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar name={l.name} size={44} square />
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="semibold" numberOfLines={1}>{l.name}</Text>
            <Text variant="caption" tone="gray">{l.rated ? `★ ${l.rating.toFixed(1)}` : t("lawyers.card.unrated")} · {l.experienceYears} {t("common.years")}</Text>
          </View>
        </PressableScale>
      ))}
      <Button title={t("stats.lawyers.cta")} onPress={() => go(() => router.navigate("/(tabs)/lawyers"))} variant="gradient" icon="users" full />
    </View>
  );
}
