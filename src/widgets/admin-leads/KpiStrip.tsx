import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Stats = { total: number; active: number; won: number; conv: number };

// Board numbers in one card: all leads, in work, won, conversion (with a bar).
export function KpiStrip({ stats }: { stats: Stats }) {
  const { t } = useT();
  const items = [
    { label: t("admLeads.kpiTotal"), value: String(stats.total) },
    { label: t("admLeads.kpiActive"), value: String(stats.active) },
    { label: t("admLeads.kpiWon"), value: String(stats.won) },
    { label: t("admLeads.kpiConv"), value: `${stats.conv}%` },
  ];
  return (
    <Card style={s.card}>
      <View style={s.row}>
        {items.map((i) => (
          <View key={i.label} style={s.cell}>
            <Text variant="h3" numberOfLines={1} adjustsFontSizeToFit>{i.value}</Text>
            <Text variant="caption" tone="gray" center numberOfLines={2}>{i.label}</Text>
          </View>
        ))}
      </View>
      <ProgressBar value={stats.conv / 100} color="#22C55E" />
      <Text variant="caption" tone="gray" center>{t("admLeads.kpiWon")}: {stats.won} / {stats.total}</Text>
    </Card>
  );
}

const s = StyleSheet.create({ card: { padding: 14, gap: 12 }, row: { flexDirection: "row", gap: 6 }, cell: { flex: 1, alignItems: "center", gap: 2 } });
