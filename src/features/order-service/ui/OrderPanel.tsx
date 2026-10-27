import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useResponseNote } from "@/entities/response-window";
import { useColors } from "@/shared/theme";
import { Button, Card, Icon, Input, Pill, Text, useErrorText } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { useOrderPanel, type OrderTarget } from "../model/useOrderPanel";
import { PassportToggle } from "./PassportToggle";
import { PayBlock } from "./PayBlock";
import { PriceBox } from "./PriceBox";
import { SellerPicker } from "./SellerPicker";

type Props = { service: OrderTarget & { price?: number }; preSeller?: { id: string; name: string }; packageId?: string; onChat: () => void };

// Order a service (TZ.md §3): price (quote), passport, the specialist (or the platform's automatic match), when they answer, a short
// description, buy. What comes next is the backend's status for the order (the specialist's answer, then the advance request) — opened on
// the order's own screen; an order the backend does not run as a marketplace one keeps its advance block here.
export function OrderPanel({ service, preSeller, packageId = "", onChat }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const note = useResponseNote();
  const errorText = useErrorText();
  const f = useOrderPanel(service, preSeller?.id ?? "", packageId);
  const o = f.created;
  if (o && o.source !== "marketplace" && o.paymentStatus !== "paid") return <PayBlock orderId={o.id} onChat={onChat} />;
  if (o) {
    const status = t(`mk6.status.${o.status}`) === `mk6.status.${o.status}` ? humanizeSlug(o.status) : t(`mk6.status.${o.status}`);
    return (
      <Card tinted style={s.col}>
        <View style={s.note}>
          <Icon name="check-circle" size={20} color={c.ok} />
          <Text variant="h4" style={s.flex}>{t("mf.create.sent")}</Text>
          {o.status ? <Pill label={status} tone="blue" small /> : null}
        </View>
        <Text variant="small" tone="gray">{t("mf.lead.client.assigned")}</Text>
        {o.workId ? <Text variant="caption" tone="gray2">{o.workId}</Text> : null}
        <Button title={t("mf.create.open")} icon="arrow-right" variant="gradient" full onPress={() => router.push({ pathname: "/orders/[id]", params: { id: o.id } })} />
      </Card>
    );
  }
  return (
    <View style={s.col}>
      <PriceBox quote={f.quote.data} loading={f.quote.isFetching && !!f.sellerId} price={service.price} />
      <PassportToggle serviceId={service.id} />
      <SellerPicker f={f} preName={preSeller?.name ?? ""} preId={preSeller?.id ?? ""} />
      <Input label={t("mf.create.problem")} value={f.problem} onChangeText={f.setProblem} placeholder={t("mf.create.problemPh")} multiline maxLength={2000} style={{ minHeight: 80, textAlignVertical: "top" }} />
      {note.text && (note.afterHours || (f.sellerId && !f.auto)) ? (
        <View style={s.note}>
          <Icon name="clock" size={16} color={note.afterHours ? c.warn : c.ok} />
          <Text variant="caption" tone={note.afterHours ? "warn" : "ok"} style={s.flex}>{note.text}</Text>
        </View>
      ) : null}
      {f.failed ? <Text variant="small" tone="err">{errorText(f.failed) === t("common.serverError") ? t("csv.orderError") : errorText(f.failed)}</Text> : null}
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
