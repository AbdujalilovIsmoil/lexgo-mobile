import { StyleSheet, View } from "react-native";
import type { UrgentCandidate } from "@/entities/admin-callcenter";
import { useCcLabel, useRegionLabel } from "@/entities/admin-callcenter";
import { Card, Icon, Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { c: UrgentCandidate; picked: boolean; disabled?: boolean; onPress: () => void };

// A ranked advocate: backend score, name, rating / workload, practice areas and the warnings.
export function CandidateRow({ c, picked, disabled, onPress }: Props) {
  const { t } = useT();
  const col = useColors();
  const label = useCcLabel();
  const region = useRegionLabel();
  const meta = [c.role, region(c.region), c.rating ? `${c.rating.toFixed(1)}★ (${c.reviewsCount})` : "", c.successRate ? t("admCcB.successRate", { n: Math.round(c.successRate) }) : "", t("admCcB.workloadN", { n: c.workload })];
  return (
    <Card onPress={disabled ? undefined : onPress} style={[s.card, { borderColor: picked ? col.accent : col.line, opacity: disabled ? 0.5 : 1 }]}>
      <View style={[s.score, { backgroundColor: col.tint2 }]}><Text variant="small" weight="bold" tone="accent">{c.score}</Text></View>
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={1}>{c.name}</Text>
        <Text variant="caption" tone="gray" numberOfLines={2}>{meta.filter(Boolean).join(" · ")}</Text>
        {c.specializations.length ? <Text variant="caption" tone="gray2" numberOfLines={1}>{c.specializations.map((x) => label("admCc.dir", x)).join(", ")}</Text> : null}
        <View style={s.tags}>
          {c.callcenter ? <Pill small tone="cy" label={t("admCcB.tagCallcenter")} /> : null}
          {c.external ? <Pill small tone="gray" label={t("admCcB.tagExternal")} /> : null}
          {!c.directionMatch ? <Pill small tone="warn" icon="alert-triangle" label={t("admCcB.tagOffDirection")} /> : null}
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
