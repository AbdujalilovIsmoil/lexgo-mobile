import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { serverIso, type SupportTicket } from "@/entities/support";

type Props = { ticket: SupportTicket; onReopen: () => void; onNew: () => void };

// A finished chat: the operator's resolution, when it ended, and the two ways forward (reopen / new chat).
export function ClosedBanner({ ticket, onReopen, onNew }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  return (
    <View style={[s.box, { borderTopColor: c.line, backgroundColor: c.surface2, paddingBottom: insets.bottom + 12 }]}>
      <View style={s.head}>
        <Icon name="check-circle" size={20} color={c.ok} />
        <View style={s.fill}>
          <Text variant="body" weight="bold">{t("sp3.closed")}</Text>
          {ticket.closedAt ? <Text variant="caption" tone="gray">{t("sp3.closedAt", { date: fmtDateTime(serverIso(ticket.closedAt), locale) })}</Text> : null}
        </View>
      </View>
      <Text variant="small" tone="gray">{ticket.resolution ? `${t("sp3.resolution")}: ${ticket.resolution}` : t("sp3.noResolution")}</Text>
      <View style={s.head}>
        <Button title={t("sp3.reopen")} variant="line" icon="refresh-cw" onPress={onReopen} style={s.fill} />
        <Button title={t("sp3.newChat")} variant="gradient" icon="plus" onPress={onNew} style={s.fill} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 10, paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
});
