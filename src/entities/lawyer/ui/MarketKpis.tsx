import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtRating } from "@/shared/lib/format";
import type { Lawyer } from "../model/types";

// The web card's three counters between two hairlines, each with its icon: rating (gold star) · years of experience · success rate.
export function MarketKpis({ lawyer: l }: { lawyer: Lawyer }) {
  const c = useColors();
  const { t, locale } = useT();
  const success = l.totalCases >= 5;
  const cells = [
    { icon: "star" as IconName, gold: true, v: l.rated ? fmtRating(l.rating, locale).replace(".", ",") : t("mkw.card.newSeller"), k: l.rated ? t("mkw.card.reviews", { count: l.reviews }) : t("mkw.card.newHint"), accent: !l.rated },
    { icon: "briefcase" as IconName, v: l.experienceYears ? String(l.experienceYears) : "—", k: t("mkw.card.experience") },
    { icon: "trending-up" as IconName, v: success ? `${Math.round(l.successRate)}%` : "—", k: success ? t("mkw.card.success") : `${t("mkw.card.success")} · ${t("mkw.card.gathering")}` },
  ];
  return (
    <View style={[s.row, { borderColor: c.line }]}>
      {cells.map((x, i) => (
        <View key={i} style={s.cell}>
          <View style={s.val}>
            {x.accent ? null : <Icon name={x.icon} size={15} color={x.gold ? "#F4B63F" : c.gray} />}
            <Text variant="body" weight="bold" numberOfLines={1} style={x.accent ? { color: c.accent, fontSize: 13 } : undefined}>{x.v}</Text>
          </View>
          <Text variant="caption" tone="gray" numberOfLines={2}>{x.k}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 12 },
  cell: { flex: 1, gap: 2 },
  val: { flexDirection: "row", alignItems: "center", gap: 4 },
});
