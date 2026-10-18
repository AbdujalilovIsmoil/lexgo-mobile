import { StyleSheet, View } from "react-native";
import { marketStageOf, OrderTrack, StageBadge, orderNumber, type MarketOrder } from "@/entities/order";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

// Number + stage, what was bought, the price and the progress track with labels.
export function DetailHeader({ order: o }: { order: MarketOrder }) {
  const { t } = useT();
  const stage = marketStageOf(o);
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="small" weight="bold" tone="accent">{orderNumber(o)}</Text>
        <StageBadge stage={stage} />
      </View>
      <Text variant="h3">{o.serviceTitle || "—"}</Text>
      {o.price ? <Text variant="h2" tone="accent">{fmtMoney(o.price)} <Text variant="small" tone="gray2">{t("common.currency")}</Text></Text> : null}
      <OrderTrack stage={stage} labels />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
