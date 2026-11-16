import { Platform, StyleSheet, View } from "react-native";
import { orderPhase, OrderTrack, StageBadge, orderNumber, type MarketOrder } from "@/entities/order";
import { phaseStep } from "@/entities/market-flow";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

// Number + stage, what was bought, the price and the progress track with labels.
export function DetailHeader({ order: o }: { order: MarketOrder }) {
  const { t } = useT();
  const phase = orderPhase(o);
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="small" tone="gray" style={s.mono}>{orderNumber(o)}</Text>
        <StageBadge phase={phase} />
      </View>
      <Text variant="h3" style={s.title}>{o.serviceTitle || "—"}</Text>
      {o.price ? <Text variant="h4" tone="accent" style={s.price}>{fmtMoney(o.price)} <Text variant="small" tone="gray">{t("common.currency")}</Text></Text> : null}
      <OrderTrack step={phaseStep(phase)} labels />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 16 },
  mono: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 12.5 },
  title: { fontSize: 20, lineHeight: 26 },
  price: { fontSize: 17, lineHeight: 22 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
