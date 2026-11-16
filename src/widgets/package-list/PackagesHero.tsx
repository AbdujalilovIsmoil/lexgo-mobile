import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { PackageFilter } from "@/entities/seller-package";

type Counts = Record<PackageFilter, number>;
const STATS: { k: "active" | "available" | "blocked"; icon: IconName }[] = [
  { k: "active", icon: "play" },
  { k: "available", icon: "check" },
  { k: "blocked", icon: "lock" },
];

// The top of the "Paketlar" tab on a light, see-through blue (not a solid blue band): the icon tile, title, lead and the three counters
// (enabled / can enable / not eligible) on white tiles.
export function PackagesHero({ counts }: { counts: Counts }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const soft = dark || glass;
  return (
    <View style={[s.box, { backgroundColor: soft ? "rgba(59,108,240,0.14)" : "rgba(29,78,216,0.07)", borderColor: soft ? "rgba(59,108,240,0.3)" : "rgba(29,78,216,0.16)" }]}>
      <View style={s.top}>
        <View style={[s.tile, { backgroundColor: soft ? c.surface : "#FFFFFF" }]} accessibilityElementsHidden importantForAccessibility="no">
          <Icon name="package" size={22} color={c.accent} />
        </View>
        <Text variant="h3" style={[s.title, { color: c.ink }]} accessibilityRole="header">{t("pkgSeller.title")}</Text>
      </View>
      <Text variant="small" tone="gray">{t("pkgSeller.lead")}</Text>
      <View style={s.stats}>
        {STATS.map(({ k, icon }) => (
          <View key={k} style={[s.stat, { backgroundColor: soft ? c.surface : "#FFFFFF" }]} accessible accessibilityLabel={`${t(`pkgSeller.stats.${k}`)}: ${counts[k]}`}>
            <Icon name={icon} size={15} color={k === "blocked" ? c.err : c.accent} />
            <Text variant="h3" style={{ color: c.ink }}>{counts[k]}</Text>
            <Text variant="caption" tone="gray" numberOfLines={2} center>{t(`pkgSeller.stats.${k}`)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { padding: 16, gap: 12, borderRadius: 20, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  tile: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, minHeight: 44, alignItems: "center", gap: 2, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 14 },
});
