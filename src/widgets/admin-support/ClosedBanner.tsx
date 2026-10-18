import { StyleSheet, View } from "react-native";
import type { SupportTicket } from "@/entities/admin-support";
import { serverIso } from "@/entities/admin-support";
import { Icon, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Shown instead of the message box once the ticket is closed: when, and with what resolution.
export function ClosedBanner({ ticket }: { ticket: SupportTicket }) {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  return (
    <View style={[s.box, { backgroundColor: c.surface2, borderTopColor: c.line, paddingBottom: insets.bottom + 12 }]}>
      <Icon name="check-circle" size={20} color={c.ok} />
      <View style={s.col}>
        <Text variant="small" weight="bold">{t("admSup.closedBanner")}</Text>
        {ticket.closedAt ? <Text variant="caption" tone="gray">{t("admSup.closedAt", { date: fmtDateTime(serverIso(ticket.closedAt), locale) })}</Text> : null}
        <Text variant="small" tone="gray">{ticket.resolution ? `${t("admSup.resolution")}: ${ticket.resolution}` : t("admSup.noResolution")}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  col: { flex: 1, gap: 2 },
});
