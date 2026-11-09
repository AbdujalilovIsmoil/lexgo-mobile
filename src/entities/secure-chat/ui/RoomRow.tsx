import { StyleSheet, View } from "react-native";
import { Archive, Users } from "lucide-react-native";
import { Avatar, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { roleKey } from "../lib/roleLabel";
import { listStamp } from "../lib/stamp";
import { lastLine } from "../model/preview";
import { peerOf, roomKind, roomTitle } from "../model/roomView";
import type { Room } from "../model/types";

const KIND_TINT = { urgent: "#EF4444", doc: "#8B5CF6", order: "#3B82F6", case: "#06B6D4", other: "" };
export const ROOM_AVATAR = 52;

// One conversation, a row of the inbox's card (see RoomsList): a rounded square avatar with the unread count on its corner, the name with the time at the right
// and the last message under it. A third small line carries the work tag / role / kind. An unread row has a stronger last message; an archived one a small mark.
// `showRole` false: a professional, whose every room is with a client — the role line would only repeat "Mijoz".
export function RoomRow({ room, myId, onPress, tag, showRole = true }: { room: Room; myId: string; onPress: () => void; tag?: string; showRole?: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  const title = roomTitle(room, myId) || t("admChat.room");
  const peer = peerOf(room, myId);
  const role = showRole && peer && roleKey(peer.role) ? t(roleKey(peer.role)) : "";
  const kind = roomKind(room);
  const archived = room.status === "archived" || room.status === "completed";
  const unread = room.unread > 0 && room.status !== "archived";
  const sub = [tag, role].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={[title, unread ? t("a11y.unreadN", { n: room.unread }) : "", room.last ? lastLine(room.last, t) : "", listStamp(room.updatedAt, t, locale)].filter(Boolean).join(". ")} style={[s.row, archived && { opacity: 0.7 }]}>
      <View>
        {peer || !room.members.length ? <Avatar name={title} size={ROOM_AVATAR} square /> : <View style={[s.group, { backgroundColor: c.tint2 }]}><Users size={24} color={c.accent} /></View>}
        {unread ? <View style={[s.badge, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white" style={s.badgeTx}>{room.unread > 99 ? "99+" : room.unread}</Text></View> : null}
      </View>
      <View style={s.col}>
        <View style={s.line}>
          <Text variant="body" weight="bold" numberOfLines={1} style={[s.flex, s.title]}>{title}</Text>
          <Text variant="caption" weight="semibold" tone={unread ? "accent" : "gray2"} style={s.small}>{listStamp(room.updatedAt, t, locale)}</Text>
        </View>
        <View style={s.line}>
          <Text variant="small" weight={unread ? "semibold" : "medium"} tone={unread ? "ink" : "gray"} numberOfLines={1} style={s.flex}>
            {room.last ? lastLine(room.last, t) : t("admChat.noMessages")}
          </Text>
          {archived && !unread ? <Archive size={15} color={c.gray2} /> : null}
        </View>
        {sub || kind !== "other" ? (
          <View style={s.line}>
            {kind !== "other" ? <View style={[s.dot, { backgroundColor: KIND_TINT[kind] }]} /> : null}
            {kind !== "other" ? <Text variant="caption" weight="semibold" style={[s.small, { color: KIND_TINT[kind] }]}>{t(`ms1.kind.${kind}`)}</Text> : null}
            {sub ? <Text variant="caption" tone="gray2" numberOfLines={1} style={[s.flex, s.small]}>{sub}</Text> : null}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  group: { width: ROOM_AVATAR, height: ROOM_AVATAR, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, minWidth: 0, gap: 2 },
  line: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: { fontSize: 15, lineHeight: 20 },
  small: { fontSize: 11, lineHeight: 15 },
  badge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
  badgeTx: { fontSize: 10, lineHeight: 13 },
});
