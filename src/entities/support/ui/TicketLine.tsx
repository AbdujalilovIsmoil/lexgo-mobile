import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { timeAgo } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { isClosed, isUrgent, ticketTitle } from "../lib/status";
import { serverIso } from "../lib/time";
import type { SupportTicket } from "../model/types";
import { SupportStatusPill } from "./SupportStatusPill";
import { useSupportLabels } from "./useLabels";

type Props = { item: SupportTicket; first: boolean; last: boolean; onPress: () => void };

// One support request as a row of the "my requests" card: chat mark, the title, the last word (or the resolution of a closed one, or
// who answers), "urgent · topic · SPT-… · when", the status and the unread count. `first` / `last` round the card.
export function TicketLine({ item, first, last, onPress }: Props) {
  const { t } = useT();
  const c = useColors();
  const labels = useSupportLabels();
  const title = ticketTitle(item, t("sp1.untitled"));
  const closed = isClosed(item.status);
  const preview = closed && item.resolution ? `✓ ${item.resolution}` : item.lastMessage && !title.startsWith(item.lastMessage.slice(0, 20)) ? item.lastMessage : item.operatorName ? t("sp1.operatorIs", { name: item.operatorName }) : "";
  const meta = [isUrgent(item.priority) ? t("sp2.urgent") : "", labels.category(item.category), item.workId, timeAgo(serverIso(item.lastMessageAt || item.updatedAt), t)].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={title}
      style={[s.row, { backgroundColor: c.surface, borderColor: c.line }, first && s.first, last && s.last, !last && { borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[s.ico, { backgroundColor: c.surface2 }]}><Icon name={closed ? "check-circle" : "message-circle"} size={19} color={closed ? c.ok : c.accent} /></View>
      <View style={s.mid}>
        <Text variant="h4" numberOfLines={2}>{title}</Text>
        {preview ? <Text variant="small" tone="gray" numberOfLines={1}>{preview}</Text> : null}
        <Text variant="caption" tone="gray2" numberOfLines={1}>{meta}</Text>
      </View>
      <View style={s.side}>
        <SupportStatusPill status={item.status} />
        {item.unreadCount > 0 ? <View style={[s.badge, { backgroundColor: c.accent }]}><Text variant="caption" tone="white" weight="bold">{item.unreadCount > 99 ? "99+" : item.unreadCount}</Text></View> : null}
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderLeftWidth: 1, borderRightWidth: 1 },
  first: { borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  ico: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1, minWidth: 0, gap: 2 },
  side: { alignItems: "flex-end", gap: 6, maxWidth: "36%" },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
