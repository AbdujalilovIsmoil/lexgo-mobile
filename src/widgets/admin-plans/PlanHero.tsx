import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";
import { planPrice, primaryPeriod, type Plan } from "@/entities/admin-plans";
import { fmtCompact } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Tariff headline: how many plans are on sale, active vs switched off, hidden ones and the cheapest price.
export function PlanHero({ plans }: { plans: Plan[] }) {
  const { t } = useT();
  const shown = plans.filter((p) => !p.hidden);
  const prices = shown.map((p) => planPrice(p, primaryPeriod(p))).filter((n) => n > 0);
  const cells = [
    [String(shown.length), t("admPlansB.total")],
    [String(shown.filter((p) => p.isActive).length), t("admPlansB.active")],
    [String(shown.filter((p) => !p.isActive).length), t("admPlansB.inactive")],
    [prices.length ? fmtCompact(Math.min(...prices)) : "—", t("admPlansB.from")],
  ];
  return (
    <Card style={s.card}>
      {cells.map(([v, l]) => <View key={l} style={s.cell}><Text variant="h2" numberOfLines={1} adjustsFontSizeToFit>{v}</Text><Text variant="caption" tone="gray" numberOfLines={1}>{l}</Text></View>)}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", padding: 14, gap: 8 },
  cell: { flex: 1, gap: 2 },
});
