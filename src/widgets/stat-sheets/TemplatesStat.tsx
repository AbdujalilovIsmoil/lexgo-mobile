import { View } from "react-native";
import { useRouter } from "expo-router";
import { useServiceCategories } from "@/entities/service";
import { Button, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { BarRow } from "./BarRow";
import { Tiles } from "./Tiles";

const COLORS = ["#1668F0", "#00A6E6", "#00A870", "#7A5CFF", "#C2680A", "#E0457F"];

// Number of services per direction; tapping a direction opens it in Services.
export function TemplatesStat({ go }: { go: (fn: () => void) => void }) {
  const { t } = useT();
  const router = useRouter();
  const { data } = useServiceCategories();
  if (!data) return <View style={{ gap: 12 }}><Skeleton height={84} round={18} /><Skeleton height={40} /><Skeleton height={40} /></View>;
  const max = Math.max(...data.map((c) => c.servicesCount), 1);
  const total = data.reduce((n, c) => n + c.servicesCount, 0);
  return (
    <View style={{ gap: 16 }}>
      <Tiles items={[{ value: total, label: t("stats.templates.total") }, { value: data.length, label: t("svc.directions") }]} />
      {data.map((c, i) => (
        <BarRow key={c.id} label={c.name} value={c.servicesCount} max={max} color={COLORS[i % COLORS.length]} onPress={() => go(() => router.navigate({ pathname: "/(tabs)/services", params: { cat: c.id } }))} />
      ))}
      <Button title={t("stats.templates.cta")} onPress={() => go(() => router.navigate("/(tabs)/services"))} variant="gradient" icon="grid" full />
    </View>
  );
}
