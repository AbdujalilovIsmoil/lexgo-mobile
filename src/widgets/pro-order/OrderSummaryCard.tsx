import { StyleSheet, View } from "react-native";
import { OrderStatusPill, TRACK, stageOf, trackIndex, type ProOrder } from "@/entities/pro-order";
import { useColors } from "@/shared/theme";
import { Card, Text } from "@/shared/ui";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// Service, price and where the order is on its way: paid → accepted → in progress → delivered → completed.
export function OrderSummaryCard({ order: o }: { order: ProOrder }) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const at = stageOf(o) === "cancelled" ? -1 : trackIndex(o.status);
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="h4" style={s.title}>{o.serviceTitle || o.workId}</Text>
        <OrderStatusPill status={o.status} />
      </View>
      <Text variant="h3">{som(o.price)}</Text>
      {at >= 0 ? (
        <View style={s.track}>
          {TRACK.map((k, i) => (
            <View key={k} style={s.step}>
              <View style={[s.bar, { backgroundColor: i <= at ? c.accent : c.line }]} />
              <Text variant="caption" tone={i <= at ? "ink" : "gray2"} numberOfLines={1}>{t(`sl12.track.${k}`)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
  title: { flex: 1 },
  track: { flexDirection: "row", gap: 4 },
  step: { flex: 1, gap: 4 },
  bar: { height: 5, borderRadius: 3 },
});
