import { StyleSheet, View } from "react-native";
import { GradientBox, Icon, Text, type IconName } from "@/shared/ui";
import { radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { PackageFilter } from "@/entities/seller-package";

type Counts = Record<PackageFilter, number>;
const STATS: { k: "active" | "available" | "blocked"; icon: IconName }[] = [
  { k: "active", icon: "play" },
  { k: "available", icon: "check" },
  { k: "blocked", icon: "lock" },
];

// Blue hero band of the "Paketlar" tab: icon tile, title, lead and the three counters (enabled / can enable / not eligible).
export function PackagesHero({ counts }: { counts: Counts }) {
  const { t } = useT();
  return (
    <GradientBox variant="dark" round={radius.rx} style={s.box}>
      <View style={s.top}>
        <View style={s.tile} accessibilityElementsHidden importantForAccessibility="no">
          <Icon name="package" size={24} color="#fff" />
        </View>
        <Text variant="h3" style={s.title} accessibilityRole="header">{t("pkgSeller.title")}</Text>
      </View>
      <Text variant="small" style={s.lead}>{t("pkgSeller.lead")}</Text>
      <View style={s.stats}>
        {STATS.map(({ k, icon }) => (
          <View key={k} style={s.stat} accessible accessibilityLabel={`${t(`pkgSeller.stats.${k}`)}: ${counts[k]}`}>
            <Icon name={icon} size={15} color={k === "blocked" ? "#FFB4B4" : "#9ED8FF"} />
            <Text variant="h3" style={s.num}>{counts[k]}</Text>
            <Text variant="caption" style={s.label} numberOfLines={2} center>{t(`pkgSeller.stats.${k}`)}</Text>
          </View>
        ))}
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { padding: 16, gap: 12 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  tile: { width: 48, height: 48, borderRadius: radius.r, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  title: { flex: 1, color: "#fff" },
  lead: { color: "rgba(255,255,255,0.86)" },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, minHeight: 44, alignItems: "center", gap: 2, paddingVertical: 10, paddingHorizontal: 4, borderRadius: radius.r, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  num: { color: "#fff" },
  label: { color: "rgba(255,255,255,0.84)" },
});
