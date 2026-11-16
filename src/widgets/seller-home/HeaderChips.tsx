import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { PressableScale, Text } from "@/shared/ui";

export type HeroStat = { key: string; icon: LucideIcon; value: string; label: string; to: string };

// The professional's numbers of the day as Adliya's quick chips inside the navy header band: the number in white, its name in the band's
// light blue (the rating as "★ 4,9"). Each chip opens its list, as the hero card's numbers did.
export function HeaderChips({ stats }: { stats: HeroStat[] }) {
  const router = useRouter();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.scroller} contentContainerStyle={s.row}>
      {stats.map((x) => (
        <PressableScale key={x.key} onPress={() => router.push(x.to as never)} scale={0.95} style={s.chip} accessibilityRole="button" accessibilityLabel={`${x.label}: ${x.value}`}>
          <Text variant="caption" weight="bold" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.value}>{x.key === "rating" ? `★ ${x.value}` : x.value}</Text>
          <Text variant="caption" weight="semibold" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.label}>{x.label}</Text>
        </PressableScale>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroller: { flexGrow: 0, marginTop: 12 },
  row: { paddingHorizontal: 16, gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, height: 30, paddingHorizontal: 11, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  value: { color: "#FFFFFF", fontSize: 12, lineHeight: 15 },
  label: { color: "#C9D6F0", fontSize: 12, lineHeight: 15 },
});
