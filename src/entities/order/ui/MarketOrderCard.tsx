import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { marketStageOf } from "../lib/stage";
import type { MarketOrder } from "../model/marketTypes";
import { OrderTrack } from "./OrderTrack";
import { StageBadge } from "./StageBadge";

// One purchase in the list: number + stage, service, progress, seller, price.
export function MarketOrderCard({ order: o, onPress }: { order: MarketOrder; onPress: () => void }) {
  const { t, locale } = useT();
  const stage = marketStageOf(o);
  return (
    <Card onPress={onPress} style={s.card}>
      <View style={s.head}>
        <Text variant="caption" weight="bold" tone="accent">{o.workId || "—"}</Text>
        <StageBadge stage={stage} />
      </View>
      <Text variant="h4" numberOfLines={2}>{o.serviceTitle || "—"}</Text>
      <OrderTrack stage={stage} />
      <View style={s.foot}>
        <Text variant="caption" tone="gray2" numberOfLines={1} style={s.flex}>{[o.lawyerName, fmtDate(o.createdAt, locale)].filter(Boolean).join(" · ")}</Text>
        {o.price ? <Text variant="small" weight="bold" tone="accent">{fmtMoney(o.price)} {t("common.currency")}</Text> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 9, padding: 16 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  flex: { flex: 1 },
});
