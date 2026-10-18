import { View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { useMktLabels, type MktOrder } from "@/entities/admin-marketplace";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Order details, the payment record and the chat/call availability.
export function OrderFacts({ order: o }: { order: MktOrder }) {
  const { t, locale } = useT();
  const label = useMktLabels();
  const d = (k: string) => t(`admMktC.${k}`);
  const cur = (c: string) => (!c || c === "UZS" ? t("adm.currency") : c);
  const p = o.payment;
  return (
    <>
      <SectionCard title={d("order")}>
        <FactRows rows={[
          { label: d("service"), value: o.serviceTitle },
          { label: d("channel"), value: o.preferredChannel ? label.channel(o.preferredChannel) : "" },
          { label: d("time"), value: o.preferredTime },
          { label: d("created"), value: fmtDateTime(o.createdAt, locale) },
          { label: d("updated"), value: fmtDateTime(o.updatedAt, locale) },
        ]} />
        {o.note ? <Text variant="small"><Text variant="caption" tone="gray">{d("note")}: </Text>{o.note}</Text> : null}
      </SectionCard>
      <SectionCard title={d("payment")}>
        {p ? (
          <FactRows rows={[
            { label: d("provider"), value: label.provider(p.provider) },
            { label: d("payStatus"), value: <Pill small tone={p.status === "paid" ? "ok" : "gray"} label={label.pay(p.status)} /> },
            { label: d("amount"), value: `${fmtMoney(p.amount)} ${cur(p.currency)}` },
            { label: d("paid"), value: `${fmtMoney(p.paidAmount)} ${cur(p.currency)}` },
            { label: d("updated"), value: fmtDateTime(p.updatedAt, locale) },
          ]} />
        ) : <Text variant="small" tone="gray">{d("noPayment")}</Text>}
      </SectionCard>
      <SectionCard title={d("contact")}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pill icon="message-circle" tone={o.roomId ? "ok" : "gray"} label={o.roomId ? d("chatOpen") : d("noChat")} />
          <Pill icon="video" tone={o.canCreateCall ? "ok" : "gray"} label={o.canCreateCall ? d("callOn") : d("callOff")} />
        </View>
      </SectionCard>
    </>
  );
}
