import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGeoLabels, type Lawyer } from "@/entities/lawyer";
import { Icon, Pill, Reveal, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The white card under the photo (it laps over the photo's foot): the practice areas, the rating and the small pills (TOP / new / busy /
// public id), then three numbers in a row — years of experience, cases won (or all cases), success — each with its icon on a soft round tile.
// `unrated` is the backend's own "not rated yet" text (rating v3).
export function SpecialistStats({ lawyer: l, top, unrated }: { lawyer: Lawyer; top?: boolean; unrated?: string }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const geo = useGeoLabels();
  const areas = l.specializations.map((a) => geo.area(a)).join(", ");
  const facts: { icon: IconName; value: string; label: string }[] = [
    { icon: "briefcase", value: l.experienceYears ? t("mkd.hero.years", { n: l.experienceYears }) : "—", label: t("mkd.hero.exp") },
    l.winsCount > 0 ? { icon: "award", value: String(l.winsCount), label: t("mkd.hero.won") } : { icon: "folder", value: l.totalCases ? String(l.totalCases) : "—", label: t("mkd.hero.cases") },
    { icon: "trending-up", value: l.totalCases > 0 ? `${Math.round(l.successRate)}%` : "—", label: t("mkd.hero.success") },
  ];
  const line = dark || glass ? c.line : "#E9EEF5";
  return (
    <Reveal i={1}>
      <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
        {areas ? <Text variant="body" weight="semibold" numberOfLines={2} style={s.areas}>{areas}</Text> : null}
        <View style={s.rate}>
          <Ionicons name="star" size={15} color="#F5B301" />
          <Text variant="small" tone="gray">{l.rated ? `${l.rating.toFixed(1).replace(".", ",")} · ${t("lw.reviews", { n: l.reviews })}` : unrated || t("lawyers.card.unrated")}</Text>
          {l.publicId ? <Text variant="small" tone="gray2">{`·  ${l.publicId}`}</Text> : null}
        </View>
        {l.promoted || top || l.isNew || !l.available ? (
          <View style={s.pills}>
            {l.promoted || top ? <Pill label={t("mkw.promo.top")} tone="warn" icon="volume-2" small /> : null}
            {l.isNew ? <Pill label={t("common.new")} tone="cy" small /> : null}
            {l.available ? null : <Pill label={t("mk1.busy")} tone="warn" small />}
          </View>
        ) : null}
        <View style={[s.row, { borderTopColor: line }]}>
          {facts.map((f, i) => (
            <View key={f.label} style={[s.fact, i > 0 && { borderLeftWidth: 1, borderLeftColor: line }]}>
              <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={f.icon} size={18} color={c.accent} /></View>
              <Text variant="body" weight="bold" numberOfLines={1} style={s.value}>{f.value}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Reveal>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: -18, padding: 16, gap: 8, borderRadius: 20, borderWidth: 1 },
  areas: { fontSize: 15, lineHeight: 21 },
  rate: { flexDirection: "row", alignItems: "center", gap: 5 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  row: { flexDirection: "row", marginTop: 6, paddingTop: 14, borderTopWidth: 1 },
  fact: { flex: 1, minWidth: 0, alignItems: "center", gap: 4, paddingHorizontal: 4 },
  ico: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  value: { fontSize: 16.5, lineHeight: 21 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 3 } })!,
});
