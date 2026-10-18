import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { useColors } from "@/shared/theme";
import { Card, Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { isBlocked, isDone, isOverdue } from "../lib/stage";
import type { ProTask } from "../model/types";

const PRIO = { high: "err", medium: "warn", low: "gray" } as const;

// One task: round check (done ⇄ todo), title, due date / priority / case / checklist line.
export function TaskRow({ task, onPress, onToggle }: { task: ProTask; onPress: () => void; onToggle: () => void }) {
  const c = useColors();
  const { t, locale } = useT();
  const done = isDone(task);
  const over = isOverdue(task);
  const left = task.checklist.filter((x) => x.done).length;
  const meta = [task.caseTitle, task.checklist.length ? t("aw7.checkCount", { done: left, total: task.checklist.length }) : ""].filter(Boolean).join(" · ");
  return (
    <Card onPress={onPress} style={s.card}>
      <View style={s.row}>
        <PressableScale onPress={onToggle} hitSlop={10} style={[s.check, { borderColor: done ? c.ok : c.line, backgroundColor: done ? c.ok : "transparent" }]}>
          {done ? <Icon name="check" size={15} tone="white" /> : null}
        </PressableScale>
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={2} tone={done ? "gray" : "ink"} style={done ? s.strike : undefined}>{task.title}</Text>
          {meta ? <Text variant="caption" tone="gray" numberOfLines={1}>{meta}</Text> : null}
          <View style={s.pills}>
            {task.dueDate ? <Pill small tone={over ? "err" : "gray"} icon={over ? "alert-circle" : "calendar"} label={fmtDate(task.dueDate, locale)} /> : null}
            <Pill small tone={PRIO[task.priority as keyof typeof PRIO] ?? "gray"} label={tOr(t, `aw11.priority.${task.priority}`, task.priority)} />
            {isBlocked(task) ? <Pill small tone="err" icon="slash" label={t("aw7.blocked")} /> : null}
          </View>
        </View>
        <Icon name="chevron-right" size={18} tone="gray" />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 4 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  strike: { textDecorationLine: "line-through" },
});
