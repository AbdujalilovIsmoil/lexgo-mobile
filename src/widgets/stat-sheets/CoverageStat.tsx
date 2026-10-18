import { View } from "react-native";
import { useRouter } from "expo-router";
import { REGION_KEYS, useLawyers } from "@/entities/lawyer";
import { useLawyerFilterStore } from "@/features/lawyer-filter";
import { Button, EmptyState, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { BarRow } from "./BarRow";

// Specialists per region (counted from the live list); tap a region to see them.
export function CoverageStat({ go }: { go: (fn: () => void) => void }) {
  const { t } = useT();
  const router = useRouter();
  const setFilter = useLawyerFilterStore((s) => s.set);
  const { data } = useLawyers();
  if (!data) return <View style={{ gap: 12 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={40} />)}</View>;
  const rows = REGION_KEYS.map((k) => ({ k, n: data.filter((l) => l.region === k).length })).sort((a, b) => b.n - a.n);
  if (!rows.some((r) => r.n)) return <EmptyState icon="map-pin" title={t("stats.coverage.empty")} compact />;
  const open = (region: string) => {
    setFilter({ region });
    go(() => router.navigate("/(tabs)/lawyers"));
  };
  return (
    <View style={{ gap: 16 }}>
      {rows.map((r) => <BarRow key={r.k} label={t(`lawyers.regions.${r.k}`)} value={r.n} max={rows[0].n} color="#7A5CFF" onPress={r.n ? () => open(r.k) : undefined} />)}
      <Button title={t("stats.coverage.cta")} onPress={() => open("")} variant="gradient" icon="users" full />
    </View>
  );
}
