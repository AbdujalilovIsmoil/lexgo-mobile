import { StyleSheet, View } from "react-native";
import { Card, Icon, Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useUrgentLabels, type UrgentCandidate } from "@/entities/urgent";

type Props = { c: UrgentCandidate; picked: boolean; disabled?: boolean; onPress: () => void };

// A ranked advocate: backend score, name, rating / workload, practice areas and the warnings.
export function CandidateRow({ c, picked, disabled, onPress }: Props) {
  const { t } = useT();
  const col = useColors();
  const label = useUrgentLabels();
  const meta = [c.role, label.region(c.region), c.rating ? `${c.rating.toFixed(1)}★ (${c.reviewsCount})` : "", c.successRate ? t("ug9.successRate", { n: Math.round(c.successRate) }) : "", t("ug9.workloadN", { n: c.workload })];
  return (
    <Card onPress={disabled ? undefined : onPress} style={[s.card, { borderColor: picked ? col.accent : col.line, opacity: disabled ? 0.5 : 1 }]}>
      <View style={[s.score, { backgroundColor: col.tint2 }]}><Text variant="small" weight="bold" tone="accent">{c.score}</Text></View>
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={1}>{c.name}</Text>
        <Text variant="caption" tone="gray" numberOfLines={2}>{meta.filter(Boolean).join(" · ")}</Text>
        {c.specializations.length ? <Text variant="caption" tone="gray2" numberOfLines={1}>{c.specializations.map((x) => label.dir(x)).join(", ")}</Text> : null}
        <View style={s.tags}>
          {c.callcenter ? <Pill small tone="cy" label={t("ug9.tagDuty")} /> : null}
          {c.external ? <Pill small tone="gray" label={t("ug9.tagExternal")} /> : null}
          {!c.directionMatch ? <Pill small tone="warn" icon="alert-triangle" label={t("ug9.tagOff")} /> : null}
        </View>
      </View>
      {picked ? <Icon name="check-circle" size={22} tone="accent" /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderWidth: 1.5 },
  score: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
});
