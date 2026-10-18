import { StyleSheet, View } from "react-native";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { roleKey } from "../lib/roleLabel";
import { listStamp } from "../lib/stamp";
import { lastLine } from "../model/preview";
import { peerOf, roomKind, roomTitle } from "../model/roomView";
import type { Room } from "../model/types";

const KIND_TINT = { urgent: "#EF4444", doc: "#8B5CF6", order: "#3B82F6", case: "#06B6D4", other: "" };
export const ROOM_AVATAR = 56;

// One conversation, Telegram-style: a flat row on the page (no card), a round avatar, the name with the time at the right
// and the last message under it with the unread count at the right. A third small line carries the work tag / role / kind.
// Rows are told apart by a hairline (see RoomsList). Unread rows are bold; archived ones are muted.
export function RoomRow({ room, myId, onPress, tag }: { room: Room; myId: string; onPress: () => void; tag?: string }) {
  const { t, locale } = useT();
  const c = useColors();
  const title = roomTitle(room, myId) || t("admChat.room");
  const peer = peerOf(room, myId);
  const role = peer && roleKey(peer.role) ? t(roleKey(peer.role)) : "";
  const kind = roomKind(room);
  const archived = room.status === "archived" || room.status === "completed";
  const unread = room.unread > 0 && room.status !== "archived";
  const sub = [tag, role].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={[title, unread ? t("a11y.unreadN", { n: room.unread }) : "", room.last ? lastLine(room.last, t) : "", listStamp(room.updatedAt, t, locale)].filter(Boolean).join(". ")} style={[s.row, archived && { opacity: 0.7 }]}>
      {peer || !room.members.length ? <Avatar name={title} size={ROOM_AVATAR} /> : <View style={[s.group, { backgroundColor: c.tint2 }]}><Icon name="users" size={24} tone="accent" /></View>}
      <View style={s.col}>
        <View style={s.line}>
          <Text variant="body" weight={unread ? "bold" : "semibold"} numberOfLines={1} style={s.flex}>{title}</Text>
          <Text variant="caption" tone={unread ? "accent" : "gray2"}>{listStamp(room.updatedAt, t, locale)}</Text>
        </View>
        <View style={s.line}>
          <Text variant="small" tone={unread ? "ink" : "gray"} numberOfLines={1} style={s.flex}>
            {room.last ? lastLine(room.last, t) : t("admChat.noMessages")}
          </Text>
          {unread ? <View style={[s.badge, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white">{room.unread > 99 ? "99+" : room.unread}</Text></View> : archived ? <Icon name="archive" size={15} color={c.gray2} /> : null}
        </View>
        {sub || kind !== "other" ? (
          <View style={s.line}>
            {kind !== "other" ? <View style={[s.dot, { backgroundColor: KIND_TINT[kind] }]} /> : null}
            {kind !== "other" ? <Text variant="caption" weight="semibold" style={{ color: KIND_TINT[kind] }}>{t(`ms1.kind.${kind}`)}</Text> : null}
            {sub ? <Text variant="caption" tone="gray2" numberOfLines={1} style={s.flex}>{sub}</Text> : null}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 },
  group: { width: ROOM_AVATAR, height: ROOM_AVATAR, borderRadius: ROOM_AVATAR / 2, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 3 },
  line: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" },
});
