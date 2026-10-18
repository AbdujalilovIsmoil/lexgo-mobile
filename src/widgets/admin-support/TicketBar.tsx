import { StyleSheet, View } from "react-native";
import { isUrgent, isWaiting, SupportStatusPill, useSupportLabels, useWaitText, type SupportTicket } from "@/entities/admin-support";
import { Button, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Access = { claimable: boolean; ownOpen: boolean; isClient: boolean; open: boolean };
type Props = { ticket: SupportTicket; acc: Access; transferOn: boolean; claiming: boolean; on: { claim: () => void; transfer: () => void; close: () => void; reopen: () => void } };

// Status line and the actions the signed-in operator may take on this ticket.
export function TicketBar({ ticket, acc, transferOn, claiming, on }: Props) {
  const { t } = useT();
  const labels = useSupportLabels();
  const wait = useWaitText();
  const note = ticket.status === "reopened" ? ticket.reopenReason && { k: "reopenReasonLbl", v: ticket.reopenReason } : ticket.status === "transferred" ? ticket.transferReason && { k: "transferReasonLbl", v: ticket.transferReason } : null;
  const reopenable = acc.isClient && !acc.open && ticket.status !== "";
  return (
    <View style={s.wrap}>
      <View style={s.line}>
        <SupportStatusPill status={ticket.status} />
        {isUrgent(ticket.priority) ? <Pill label={t("admSup.urgent")} tone="err" icon="alert-circle" small /> : null}
        {isWaiting(ticket.status) ? <Pill label={wait(ticket.createdAt)} tone="warn" icon="clock" small /> : null}
        <Text variant="caption" tone="gray" numberOfLines={1} style={s.topic}>{labels.category(ticket.category)}</Text>
      </View>
      {note ? <Text variant="small" tone="gray"><Text variant="small" weight="bold">{t(`admSup.${note.k}`)}: </Text>{note.v}</Text> : null}
      <View style={s.line}>
        {acc.claimable ? <Button title={t("admSup.claim")} size="sm" icon="user-check" onPress={on.claim} loading={claiming} /> : null}
        {acc.ownOpen ? <Button title={t("admSup.transfer")} size="sm" variant="line" icon="share-2" onPress={on.transfer} disabled={!transferOn} /> : null}
        {acc.ownOpen ? <Button title={t("admSup.close")} size="sm" variant="line" icon="check-circle" onPress={on.close} /> : null}
        {reopenable ? <Button title={t("admSup.reopen")} size="sm" variant="line" icon="rotate-ccw" onPress={on.reopen} /> : null}
      </View>
      {acc.ownOpen && !transferOn ? <Text variant="caption" tone="gray2">{t("admSup.transferOff")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  line: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  topic: { flexShrink: 1 },
});
