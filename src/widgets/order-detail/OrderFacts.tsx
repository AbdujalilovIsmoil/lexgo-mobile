import { StyleSheet, View } from "react-native";
import type { MarketOrder } from "@/entities/order";
import { Card, Pill, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";

// Payment, contact preferences, dates (ordered, work started, due by, completed — the backend's) and the client's own note.
export function OrderFacts({ order: o }: { order: MarketOrder }) {
  const { t, locale } = useT();
  const paid = o.paymentStatus === "paid";
  const channel = o.preferredChannel && t(`mk3.channels.${o.preferredChannel}`) !== `mk3.channels.${o.preferredChannel}` ? t(`mk3.channels.${o.preferredChannel}`) : o.preferredChannel;
  return (
    <View style={s.col}>
      <FactRows rows={[
        { label: t("ord.payStatus"), value: <Pill label={paid ? t("ord.paid") : o.paymentStatus === "cancelled" ? t("mk4.payCancelled") : t("mk4.payWaiting")} tone={paid ? "ok" : o.paymentStatus === "cancelled" ? "err" : "warn"} small /> },
        { label: t("mk3.channelShort"), value: channel },
        { label: t("mk3.timeShort"), value: o.preferredTime },
        { label: t("ord.created"), value: fmtDateTime(o.requestedAt || o.createdAt, locale) },
        { label: t("mf.due.started"), value: o.flow.startedAt ? fmtDateTime(o.flow.startedAt, locale) : undefined },
        { label: t("mf.due.due"), value: o.flow.expectedCompletedAt ? fmtDateTime(o.flow.expectedCompletedAt, locale) : undefined },
        { label: t("mf.due.completed"), value: o.flow.completedAt ? fmtDateTime(o.flow.completedAt, locale) : undefined },
      ]} />
      {o.note ? <Card tinted style={s.note}><Text variant="caption" tone="gray" weight="bold">{t("mk4.yourNote")}</Text><Text variant="small">{o.note}</Text></Card> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  note: { gap: 3, padding: 14 },
});
