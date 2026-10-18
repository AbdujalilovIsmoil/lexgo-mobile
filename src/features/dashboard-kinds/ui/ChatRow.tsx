import { StyleSheet, View } from "react-native";
import type { ChatRoom } from "@/entities/client-stats";
import { useT } from "@/shared/i18n";
import { timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";

// One secure chat room: the other person, the last message and the unread counter.
export function ChatRow({ room, onPress }: { room: ChatRoom; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  return (
    <RowCard
      avatar={room.peerName || "?"}
      title={room.peerName || t("cl4.people.specialist")}
      subtitle={room.lastText}
      meta={timeAgo(room.lastAt, t)}
      onPress={onPress}
      right={room.unread > 0 ? <View style={[s.badge, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white">{room.unread}</Text></View> : undefined}
    />
  );
}

const s = StyleSheet.create({
  badge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: "center", justifyContent: "center" },
});
