import { StyleSheet, View } from "react-native";
import { useResponseNote } from "@/entities/response-window";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useOrderPanel, type OrderTarget } from "../model/useOrderPanel";
import { PassportToggle } from "./PassportToggle";
import { PayBlock } from "./PayBlock";
import { PriceBox } from "./PriceBox";
import { SellerPicker } from "./SellerPicker";

type Props = { service: OrderTarget & { price?: number }; preSeller?: { id: string; name: string }; packageId?: string; onChat: () => void };

// Order a service from an advocate: price (quote), passport, advocate picker, when they answer,
// buy; the next screen is the advance that opens the private chat.
export function OrderPanel({ service, preSeller, packageId = "", onChat }: Props) {
  const { t } = useT();
  const c = useColors();
  const note = useResponseNote();
  const f = useOrderPanel(service, preSeller?.id ?? "", packageId);
  if (f.orderId) return <PayBlock orderId={f.orderId} onChat={onChat} />;
  return (
    <View style={s.col}>
      <PriceBox quote={f.quote.data} loading={f.quote.isFetching && !!f.sellerId} price={service.price} />
      <PassportToggle serviceId={service.id} />
      <SellerPicker f={f} preName={preSeller?.name ?? ""} preId={preSeller?.id ?? ""} />
      {note.afterHours || f.sellerId ? (
        <View style={s.note}>
          <Icon name="clock" size={16} color={note.afterHours ? c.warn : c.ok} />
          <Text variant="caption" tone={note.afterHours ? "warn" : "ok"} style={s.flex}>{note.afterHours ? t("csv.afterHours", { when: note.respondBy }) : t("csv.respondBy", { when: note.respondBy })}</Text>
        </View>
      ) : null}
      {f.failed ? <Text variant="small" tone="err">{t("csv.orderError")}</Text> : null}
      <Button title={f.busy ? t("csv.buying") : t("csv.buy")} onPress={() => void f.buy()} loading={f.busy} variant="gradient" size="lg" full />
      <Text variant="caption" tone="gray" center>{t("csv.orderNote")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1 },
});
