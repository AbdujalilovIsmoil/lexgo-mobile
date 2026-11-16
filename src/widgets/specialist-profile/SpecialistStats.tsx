import { Platform, StyleSheet, View } from "react-native";
import { Icon, Reveal, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { fmtRating } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { Lawyer } from "@/entities/lawyer";

// The web hero's six numbers (Adliya .sp-stats): a 3 × 2 grid of white tiles — the icon in blue, the number, the label under it.
// rating · ratings · years · cases · success · orders done; an unknown one is "—".
export function SpecialistStats({ lawyer: l }: { lawyer: Lawyer }) {
  const { t, locale } = useT();
  const { colors: c, dark, glass } = useTheme();
  const success = l.totalCases > 0;
  const facts: { icon: IconName; label: string; value?: string }[] = [
    { icon: "star", label: t("mkd.stats.rating"), value: l.rated ? fmtRating(l.rating, locale).replace(".", ",") : undefined },
    { icon: "message-circle", label: t("mkd.stats.reviews"), value: String(l.reviews) },
    { icon: "briefcase", label: t("mkd.stats.experience"), value: String(l.experienceYears) },
    { icon: "folder", label: t("mkd.stats.cases"), value: l.totalCases ? String(l.totalCases) : undefined },
    { icon: "trending-up", label: t("mkd.stats.success"), value: success ? `${Math.round(l.successRate)}%` : undefined },
    { icon: "check-circle", label: t("mkd.stats.completed"), value: String(l.completed) },
  ];
  const tile = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" };
  return (
    <Reveal i={1}>
      <View style={s.grid}>
        {facts.map((f) => (
          <View key={f.label} style={[s.tile, tile, !glass && s.shadow]}>
            <Icon name={f.icon} size={17} color={c.accent} />
            <Text weight="bold" numberOfLines={1} maxFontSizeMultiplier={1.2} style={[s.value, !f.value && { color: c.gray2 }]}>{f.value || "—"}</Text>
            <Text variant="caption" tone="gray" numberOfLines={2} maxFontSizeMultiplier={1.2} style={s.label}>{f.label}</Text>
          </View>
        ))}
      </View>
    </Reveal>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 18, marginTop: 16 },
  tile: { flexBasis: "30%", flexGrow: 1, alignItems: "center", gap: 3, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 18, borderWidth: 1 },
  value: { fontSize: 18, lineHeight: 23, marginTop: 2 },
  label: { fontSize: 11.5, lineHeight: 14, textAlign: "center" },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
