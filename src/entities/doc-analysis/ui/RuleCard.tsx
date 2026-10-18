import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { PricingRule } from "../model/types";

// The advocate-review price list exactly as the server publishes it.
export function RuleCard({ rule }: { rule: PricingRule }) {
  const { t } = useT();
  const som = (n: number) => `${fmtMoney(n)} ${t("common.currency")}`;
  return (
    <Card tinted style={s.card}>
      <Text variant="h4">{t("dc7.rulesTitle")}</Text>
      <Text variant="caption" tone="gray">{t("dc7.rulesNote", { n: rule.bands[0]?.max ?? 10 })}</Text>
      {rule.bands.map((b) => (
        <View key={b.min} style={s.row}>
          <Text variant="small">{t("dc7.band", { a: b.min, b: b.max })}</Text>
          <Text variant="small" weight="bold">{som(b.amount)}</Text>
        </View>
      ))}
      {rule.extraPageAmount ? <View style={s.row}><Text variant="small">{t("dc7.extraPage")}</Text><Text variant="small" weight="bold">+ {som(rule.extraPageAmount)}</Text></View> : null}
      {rule.urgentPercent ? <View style={s.row}><Text variant="small">{t("dc7.urgent")}</Text><Text variant="small" weight="bold">+ {rule.urgentPercent}%</Text></View> : null}
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 6 }, row: { flexDirection: "row", justifyContent: "space-between", gap: 8 } });
