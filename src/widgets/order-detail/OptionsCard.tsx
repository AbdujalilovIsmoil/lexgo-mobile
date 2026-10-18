import { StyleSheet, View } from "react-native";
import type { MarketOrder } from "@/entities/order";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

// What was chosen at purchase: the base price, each selected option and what it added, and the backend's total (never recomputed).
export function OptionsCard({ order: o }: { order: MarketOrder }) {
  const { t } = useT();
  const q = o.quote;
  if (!q || !q.lines.length) return null;
  const row = (label: string, v: number, bold?: boolean) => (
    <View key={label} style={s.row}>
      <Text variant="small" weight={bold ? "bold" : "regular"} tone={bold ? "ink" : "gray"} style={s.flex}>{label}</Text>
      <Text variant="small" weight="bold" tone={bold ? "accent" : "ink"}>{fmtMoney(v)} {t("common.currency")}</Text>
    </View>
  );
  return (
    <Card style={s.card}>
      <Text variant="body" weight="bold">{t("ntd.od.options")}</Text>
      {row(t("ntd.po.base"), q.basePrice)}
      {q.lines.map((l) => row(l.label, l.amount))}
      {row(t("ntd.po.total"), q.totalPrice, true)}
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 8, padding: 14 }, row: { flexDirection: "row", gap: 10 }, flex: { flex: 1 } });
