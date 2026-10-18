import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { isClosed, isWaiting, scheduleText, SupportStatusPill, useSupportHours, useSupportLabels, type SupportTicket } from "@/entities/support";
import { useAssistStore } from "@/features/support";

// Status strip under the title: who is handling the chat, and what the user is waiting for.
export function TicketBanner({ ticket }: { ticket: SupportTicket }) {
  const { t } = useT();
  const c = useColors();
  const hours = useSupportHours().data;
  const labels = useSupportLabels();
  const card = useAssistStore((s) => s.cards).filter((x) => x.ticketId === ticket.id).pop();
  const connecting = !ticket.operatorName && isWaiting(ticket.status);
  const who = ticket.operatorName ? t("sp3.operatorIs", { name: ticket.operatorName }) : connecting ? t("sp3.connecting") : ticket.status === "ai_handling" ? t("sp3.aiHandling") : t("sp3.team");
  const night = hours?.open === false ? t("sp3.hours", { hours: scheduleText(hours, (d) => t(`sp4.days.${d}`)) }) : "";
  const meta = [labels.category(ticket.category), ticket.workId].filter(Boolean).join(" · ");
  const line = isClosed(ticket.status) ? meta : hours ? (hours.open ? t("sp3.replyFast") : night) : "";
  const confirm = ticket.status === "waiting_client_confirm";
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <SupportStatusPill status={ticket.status} />
        <Text variant="caption" tone="gray" numberOfLines={1} style={s.fill}>{who}</Text>
      </View>
      {line ? <Text variant="caption" tone="gray">{line}</Text> : null}
      {connecting ? (
        <View style={[s.box, { backgroundColor: c.tint2 }]}>
          <Icon name="clock" size={18} color={c.accent} />
          <View style={s.fill}>
            <Text variant="small" weight="bold">{t("sp3.waitTitle")}</Text>
            <Text variant="caption" tone="gray">{t("sp3.waitText")}</Text>
          </View>
        </View>
      ) : null}
      {confirm ? (
        <View style={[s.box, { backgroundColor: c.warnBg }]}>
          <Icon name="alert-circle" size={18} color={c.warn} />
          <View style={s.fill}>
            <Text variant="small" weight="bold">{t("sp3.confirmTitle")}</Text>
            <Text variant="caption" tone="gray">{t("sp3.confirmText")}</Text>
          </View>
          {card ? <Button title={t("sp3.confirmOpen")} size="sm" variant="line" onPress={() => useAssistStore.getState().open(card.key)} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
  box: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16 },
});
