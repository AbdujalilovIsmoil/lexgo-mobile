import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { isLive, type Invited } from "@/entities/call";
import { fmtTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { MeetingTicket } from "./MeetingTicket";

type Props = { item: Invited; myId: string; first: boolean; last: boolean; onOpen: () => void; onJoin: () => void };

// One row of the day timeline: the start time and a dot on a vertical line on the left, the meeting on the right.
export function TimelineRow({ item, myId, first, last, onOpen, onJoin }: Props) {
  const c = useColors();
  const live = isLive(item.callStatus);
  return (
    <View style={s.row}>
      <View style={s.rail}>
        <Text variant="caption" weight="bold" tone="gray">{fmtTime(item.startedAt)}</Text>
        <View style={s.line}>
          <View style={[s.seg, { backgroundColor: first ? "transparent" : c.line }]} />
          <View style={[s.dot, { backgroundColor: live ? c.ok : c.gray2, borderColor: c.bg }]} />
          <View style={[s.seg, { backgroundColor: last ? "transparent" : c.line }]} />
        </View>
      </View>
      <View style={s.card}><MeetingTicket item={item} myId={myId} onOpen={onOpen} onJoin={onJoin} /></View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingVertical: 5 },
  rail: { width: 46, alignItems: "center", gap: 2 },
  line: { flex: 1, alignItems: "center", width: 14 },
  seg: { flex: 1, width: 2 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  card: { flex: 1 },
});
