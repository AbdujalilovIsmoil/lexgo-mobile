import { View } from "react-native";
import { Card, Pill, Text } from "@/shared/ui";
import { FactRows, StatusPill } from "@/shared/ui/admin";
import { useMktLabels, type MktOrder } from "@/entities/admin-marketplace";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Pay badge is only worth showing when it adds information to the order status.
const showPay = (o: MktOrder) => !!o.paymentStatus && !(o.status === "cancelled" && o.paymentStatus === "cancelled") && !(o.status === "pending_payment" && o.paymentStatus === "pending");

// Header of the order sheet: statuses, service, seller type · channel, the price and the work/order/payment ids.
export function OrderTicket({ order: o }: { order: MktOrder }) {
  const { t } = useT();
  const label = useMktLabels();
  return (
    <Card tinted style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <StatusPill status={o.status} label={label.status(o.status)} />
        {showPay(o) ? <Pill small tone={o.paymentStatus === "paid" ? "ok" : "gray"} label={label.pay(o.paymentStatus)} /> : null}
      </View>
      <Text variant="h4">{o.serviceTitle || "—"}</Text>
      <Text variant="small" tone="gray">{[label.type(o.sellerType), o.preferredChannel ? label.channel(o.preferredChannel) : ""].filter(Boolean).join(" · ")}</Text>
      <Text variant="h3">{fmtMoney(o.price)} {o.currency === "UZS" ? t("adm.currency") : o.currency}</Text>
      <FactRows rows={[
        { label: t("admMktC.ids.work"), value: o.workId },
        { label: t("admMktC.ids.order"), value: o.orderWorkId },
        { label: t("admMktC.ids.payment"), value: o.payment?.workId },
      ]} />
    </Card>
  );
}
