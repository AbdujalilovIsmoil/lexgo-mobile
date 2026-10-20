import { StyleSheet, View } from "react-native";
import { Button, Icon, Pill, PressableScale, Text } from "@/shared/ui";
import type { TaskStatus, TeamTask } from "@/entities/team-tasks";
import { timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { dueText } from "./dueText";
import { useStatusColor } from "./StatusBar";

// The action a status change is named by: forward moves are "Start" / "Send to testing" / "Approve as ready"; testing → in progress is
// "Send back" and needs a comment.
export const actKey = (from: TaskStatus, to: TaskStatus): "in_progress" | "testing" | "ready" | "return" => (from === "testing" && to === "in_progress" ? "return" : (to as "in_progress" | "testing" | "ready"));
const FORWARD: Record<TaskStatus, TaskStatus> = { new: "in_progress", in_progress: "testing", testing: "ready", ready: "ready" };

type Props = { item: TeamTask; busy: boolean; onOpen: () => void; onMove: (to: TaskStatus) => void };

// One task as a compact row: its code and status, the title, who has it, the deadline (red when late) and — when the server allows — the
// one-tap forward action.
export function TaskRow({ item, busy, onOpen, onMove }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const color = useStatusColor()(item.status);
  const forward = item.actions.canChangeStatus ? item.actions.next.find((n) => n === FORWARD[item.status]) : undefined;
  const who = item.assignees.length ? item.assignees.map((p) => p.name).slice(0, 2).join(", ") + (item.assignees.length > 2 ? ` +${item.assignees.length - 2}` : "") : t("ttm.unassigned");
  return (
    <PressableScale onPress={onOpen} accessibilityLabel={`${item.code} ${item.title}`} style={[s.card, { backgroundColor: c.surface, borderColor: item.overdue ? `${c.err}66` : c.line }]}>
      <View style={s.head}>
        <Text variant="caption" weight="bold" tone="gray">{item.code}</Text>
        <View style={s.fill} />
        <Pill small label={t(`ttm.status.${item.status}`)} tone={item.status === "ready" ? "ok" : item.status === "testing" ? "warn" : item.status === "in_progress" ? "blue" : "gray"} />
      </View>
      <Text variant="body" weight="bold" numberOfLines={2}>{item.title}</Text>
      <View style={s.meta}>
        <Icon name="users" size={13} color={item.assignees.length ? c.gray : c.warn} />
        <Text variant="caption" numberOfLines={1} style={[s.fill, { color: item.assignees.length ? c.gray : c.warn }]}>{who}</Text>
      </View>
      <View style={s.foot}>
        <View style={s.due}>
          <Icon name={item.overdue ? "alert-circle" : "clock"} size={13} color={item.overdue ? c.err : c.gray2} />
          <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: item.overdue ? c.err : c.gray2 }}>{item.overdue ? `${t("ttm.overdue")} · ` : ""}{dueText(item.deadlineAt, t, locale)}</Text>
        </View>
        <Text variant="caption" tone="gray2">{timeAgo(item.updatedAt, t)}</Text>
      </View>
      {forward ? <Button title={t(`ttm.act.${actKey(item.status, forward)}`)} icon="arrow-right" size="sm" variant={forward === "ready" ? "gradient" : "soft"} loading={busy} onPress={() => onMove(forward)} style={s.go} /> : null}
      <View style={[s.edge, { backgroundColor: color }]} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, paddingLeft: 18, borderRadius: 20, borderWidth: 1, gap: 8, overflow: "hidden" },
  edge: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  due: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  go: { alignSelf: "flex-start" },
});
