import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { timeAgo } from "@/shared/lib/format";
import { brand } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { isClosed, isUrgent, ticketTitle } from "../lib/status";
import { serverIso } from "../lib/time";
import type { SupportTicket } from "../model/types";
import { SupportStatusPill } from "./SupportStatusPill";
import { useSupportLabels } from "./useLabels";

type Props = { item: SupportTicket; onPress: () => void };

// One of my chats: title, last message, topic · public id · age, status pill and the unread badge.
export function TicketRow({ item, onPress }: Props) {
  const { t } = useT();
  const labels = useSupportLabels();
  const title = ticketTitle(item, t("sp1.untitled"));
  const preview = item.lastMessage && !title.startsWith(item.lastMessage.slice(0, 20)) ? item.lastMessage : item.operatorName ? t("sp1.operatorIs", { name: item.operatorName }) : "";
  const meta = [isUrgent(item.priority) ? t("sp2.urgent") : "", labels.category(item.category), item.workId, timeAgo(serverIso(item.lastMessageAt || item.updatedAt), t)].filter(Boolean).join(" · ");
  return (
    <RowCard
      icon={isClosed(item.status) ? "check-circle" : "headphones"}
      title={title}
      subtitle={(isClosed(item.status) && item.resolution ? `✓ ${item.resolution}` : preview) || undefined}
      meta={meta}
      onPress={onPress}
      right={
        <View style={s.right}>
          <SupportStatusPill status={item.status} />
          {item.unreadCount > 0 ? <View style={[s.badge, { backgroundColor: brand.b600 }]}><Text variant="caption" tone="white" weight="bold">{item.unreadCount > 99 ? "99+" : item.unreadCount}</Text></View> : null}
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  right: { alignItems: "flex-end", gap: 6 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
