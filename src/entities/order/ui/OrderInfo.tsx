import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { ORDER_STATUS_TONE, type Order } from "../model/types";
import { Pill, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Key facts of one order as hairline rows.
export function OrderInfo({ order }: { order: Order }) {
  const c = useColors();
  const { t, locale } = useT();
  const key = `profile.status.${order.status}`;
  const status = t(key) === key ? order.status : t(key);
  const rows: [string, React.ReactNode][] = [
    [t("ord.status"), <Pill key="s" label={status} tone={ORDER_STATUS_TONE[order.status] ?? "gray"} small />],
    [t("ord.payStatus"), <Pill key="p" label={order.paymentStatus === "paid" ? t("ord.paid") : t("ord.unpaid")} tone={order.paymentStatus === "paid" ? "ok" : "warn"} small />],
    ...(order.amount ? [[t("ord.price"), <Text key="a" variant="small" weight="bold" tone="accent">{fmtMoney(order.amount)} {t("common.currency")}</Text>] as [string, React.ReactNode]] : []),
    ...(order.lawyerName ? [[t("ord.lawyer"), <Text key="l" variant="small" weight="semibold">{order.lawyerName}</Text>] as [string, React.ReactNode]] : []),
    [t("ord.created"), <Text key="d" variant="small">{fmtDate(order.createdAt, locale)}</Text>],
  ];
  return (
    <View style={[s.box, { borderColor: c.line }]}>
      {rows.map(([k, v], i) => (
        <View key={i} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
          <Text variant="caption" tone="gray">{k}</Text>
          {v}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 13 },
});
