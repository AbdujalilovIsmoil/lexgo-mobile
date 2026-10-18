import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import type { Lawyer } from "@/entities/lawyer";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

function Fact({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const c = useColors();
  return (
    <View style={[s.fact, { backgroundColor: c.tint, borderColor: c.line }]}>
      <Icon name={icon} size={16} tone="accent" />
      <Text variant="h4">{value}</Text>
      <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
    </View>
  );
}

// Six at-a-glance numbers: rating, experience, success rate, then cases and finished orders.
export function LawyerFacts({ lawyer }: { lawyer: Lawyer }) {
  const { t } = useT();
  return (
    <View style={{ gap: 10 }}>
    <View style={s.row}>
      <Fact icon="star" value={lawyer.rated ? lawyer.rating.toFixed(1) : "—"} label={lawyer.rated ? t("lw.reviews", { n: lawyer.reviews }) : t("lawyers.card.unrated")} />
      <Fact icon="briefcase" value={`${lawyer.experienceYears}`} label={`${t("lw.experience")} · ${t("lw.yearsShort")}`} />
      <Fact icon="award" value={lawyer.totalCases ? `${Math.round(lawyer.successRate)}%` : "—"} label={t("lw.success")} />
    </View>
    <View style={s.row}>
      <Fact icon="folder" value={lawyer.totalCases ? `${lawyer.totalCases}` : "—"} label={t("mk2.statCases")} />
      <Fact icon="check-circle" value={`${lawyer.completed}`} label={t("mk2.statCompleted")} />
    </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  fact: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 12, gap: 3 },
});
