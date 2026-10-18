import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Icon, Pill, Text } from "@/shared/ui";
import { csLabel, type Invited } from "@/entities/call";
import { fmtTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { JoinButton } from "./JoinButton";
import type { Phase } from "./lib/week";

const OUT = ["removed", "declined"];

type Props = { item: Invited; myId: string; phase: Phase; first: boolean; last: boolean; onOpen: (m: Invited) => void; onJoin: (m: Invited) => void };

// One meeting of the agenda: its time and a dot on the rail at the left, a card at the right (title in two lines, host,
// video / audio mark, a status pill) and — only while it runs or starts soon — a short Join button.
export const MeetingRow = memo(function MeetingRow({ item, myId, phase, first, last, onOpen, onJoin }: Props) {
  const { t } = useT();
  const c = useColors();
  const mine = item.callerId === myId;
  const audio = item.type === "audio";
  const canJoin = (phase === "live" || phase === "soon") && !OUT.includes(item.status);
  const title = item.title || t("admMeet.untitled");
  const host = mine ? t("meetUx.you") : item.callerName || t("admMeet.someone");
  const time = fmtTime(item.startedAt);
  const dot = phase === "live" ? c.ok : phase === "soon" ? c.accent : c.gray2;
  return (
    <View style={s.row}>
      <View style={s.rail}>
        <Text variant="small" weight="bold">{time}</Text>
        <View style={s.line}>
          <View style={[s.seg, { backgroundColor: first ? "transparent" : c.line }]} />
          <View style={[s.dot, { backgroundColor: dot, borderColor: c.bg }]} />
          <View style={[s.seg, { backgroundColor: last ? "transparent" : c.line }]} />
        </View>
      </View>
      <Card onPress={() => onOpen(item)} style={s.card} accessibilityLabel={`${time}, ${title}, ${host}`}>
        <View style={s.top}>
          <Text variant="body" weight="semibold" numberOfLines={2} style={s.title}>{title}</Text>
          {phase === "live" ? <Pill small tone="ok" live label={t("ms7.live")} /> : phase === "soon" ? <Pill small tone="blue" label={t("meetUx.soon")} /> : phase === "over" ? <Pill small tone="gray" label={csLabel(t, item.callStatus)} /> : null}
        </View>
        <View style={s.meta}>
          <View style={[s.fmt, { backgroundColor: c.tint2 }]} accessible accessibilityLabel={t(`admMeet.fmt.${item.type}`)}><Icon name={audio ? "mic" : "video"} size={13} color={c.accent} /></View>
          <Avatar name={host} size={22} />
          <Text variant="small" tone="gray" numberOfLines={1} style={s.host}>{host}{phase === "live" && item.autoEndAt ? ` · ${t("ms7.until", { time: fmtTime(item.autoEndAt) })}` : ""}</Text>
          {canJoin ? <JoinButton icon={audio ? "mic" : "video"} label={t(mine || item.status === "joined" ? "admMeet.rejoin" : "admMeet.join")} onPress={() => onJoin(item)} /> : null}
        </View>
      </Card>
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingVertical: 5 },
  rail: { width: 46, alignItems: "center", gap: 4, paddingTop: 12 },
  line: { flex: 1, alignItems: "center", width: 14 },
  seg: { flex: 1, width: 2 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  card: { flex: 1, padding: 12, gap: 10 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title: { flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 28 },
  fmt: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  host: { flex: 1 },
});
