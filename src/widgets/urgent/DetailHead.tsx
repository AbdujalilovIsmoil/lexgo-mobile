import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { StatusBadge, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { fmtMoney } from "@/shared/lib/money";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { PaymentNote } from "./PaymentNote";

// Status, work id, channel, length, price, the call state and — when the backend sends one — the payment step.
export function DetailHead({ req, waiting }: { req: UrgentRequest; waiting?: boolean }) {
  const { t, locale } = useT();
  const label = useUrgentLabels();
  return (
    <SectionCard>
      <View style={s.row}>
        <StatusBadge status={req.status} small={false} />
        {req.workId ? <Pill tone="blue" label={req.workId} /> : null}
        {req.channel ? <Pill tone="gray" icon={req.channel === "chat" ? "message-circle" : "video"} label={label.channel(req.callChannel === "audio" ? "audio" : req.channel)} /> : null}
        {req.meetingMinutes ? <Pill tone="gray" icon="clock" label={t("ug4.minutesN", { n: req.meetingMinutes })} /> : null}
        {req.amount ? <Pill tone="gray" icon="credit-card" label={`${fmtMoney(req.amount)} ${t("adm.currency")}`} /> : null}
        {req.slaBreached ? <Pill tone="err" icon="alert-triangle" label={t("ug4.sla")} /> : null}
        {req.viaOperator ? <Pill tone="cy" icon="headphones" label={t("ug4.byOperator")} /> : null}
      </View>
      {req.callStatus ? <Text variant="small" tone="gray">{label.call(req.callStatus)}</Text> : null}
      {req.scheduledAt ? <Text variant="body" weight="semibold">{t("ug4.scheduledFor", { when: fmtDateTime(req.scheduledAt, locale) })}</Text> : null}
      {waiting ? <Text variant="caption" tone="gray">{t("ug5.joinWaiting")}</Text> : null}
      {req.meetingNote ? <Text variant="small" tone="gray">{req.meetingNote}</Text> : null}
      <PaymentNote req={req} />
      <Text variant="caption" tone="gray2">{t("ug7.created", { when: fmtDateTime(req.createdAt, locale) })}</Text>
    </SectionCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
