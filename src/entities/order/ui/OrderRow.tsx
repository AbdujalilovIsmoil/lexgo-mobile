import { StyleSheet, View } from "react-native";
import { Card, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { ORDER_STATUS_TONE, type Order } from "../model/types";

export function OrderRow({ order, onPress }: { order: Order; onPress?: () => void }) {
  const { t, locale } = useT();
  const statusKey = `profile.status.${order.status}`;
  const statusLabel = t(statusKey) === statusKey ? order.status : t(statusKey);
  return (
    <Card style={s.card} onPress={onPress}>
      <View style={s.head}>
        <Text variant="h4" numberOfLines={2} style={s.title}>
          {order.title || order.serviceName || order.workId || "—"}
        </Text>
        <Pill label={statusLabel} tone={ORDER_STATUS_TONE[order.status] ?? "gray"} small />
      </View>
      {order.serviceName && order.serviceName !== order.title ? (
        <Text variant="small" tone="gray" numberOfLines={1}>
          {order.serviceName}
        </Text>
      ) : null}
      <View style={s.meta}>
        <Text variant="caption" tone="gray2">
          {fmtDate(order.createdAt, locale)}
          {order.lawyerName ? ` · ${order.lawyerName}` : ""}
        </Text>
        {order.amount ? (
          <Text variant="small" weight="bold" tone="accent">
            {fmtMoney(order.amount)} {t("common.currency")}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 6, padding: 16 },
  head: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  title: { flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
});
