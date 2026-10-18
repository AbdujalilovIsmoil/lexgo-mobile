import { StyleSheet, View } from "react-native";
import { useCcLabel, type UrgentRequest } from "@/entities/admin-callcenter";
import { Pill } from "@/shared/ui";
import { StatusPill } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Status, work id, channel, length, price and the SLA warning of one request.
export function UrgentHead({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  const label = useCcLabel();
  return (
    <View style={s.row}>
      <StatusPill status={req.status} label={label("admCc.stat", req.status)} small={false} />
      {req.workId ? <Pill tone="blue" label={req.workId} /> : null}
      {req.channel ? <Pill tone="gray" icon={req.channel === "chat" ? "message-circle" : "video"} label={label("admCc.ch", req.channel)} /> : null}
      {req.meetingMinutes ? <Pill tone="gray" icon="clock" label={t("admCc.minutesN", { n: req.meetingMinutes })} /> : null}
      {req.amount ? <Pill tone="gray" icon="credit-card" label={`${fmtMoney(req.amount)} ${t("adm.currency")}`} /> : null}
      {req.slaBreached ? <Pill tone="err" icon="alert-triangle" label={t("admCc.sla")} /> : null}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
