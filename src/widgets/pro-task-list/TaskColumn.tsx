import { StyleSheet, View } from "react-native";
import { STAGE_TINT, TaskCard, type ProTask, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";

type Props = {
  stage: TaskStage; tasks: ProTask[]; total: number; filtered: boolean;
  onOpen: (t: ProTask) => void; onMove: (t: ProTask, s: TaskStage) => void; onPick: (t: ProTask) => void;
};

// One kanban column (its width comes from the board's carousel): colour dot, stage name, task count and its cards.
export function TaskColumn({ stage, tasks, total, filtered, onOpen, onMove, onPick }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={[s.col, { backgroundColor: c.surface2, borderColor: c.line }]}>
      <View style={s.head}>
        <View style={[s.dot, { backgroundColor: c[STAGE_TINT[stage]] }]} />
        <Text variant="body" weight="bold" numberOfLines={1} style={s.fill}>{t(`aw7.tab.${stage}`)}</Text>
        <View style={[s.count, { backgroundColor: c.surface }]}><Text variant="caption" weight="bold">{filtered ? tasks.length : total}</Text></View>
      </View>
      {tasks.length ? tasks.map((x) => <TaskCard key={x.id} task={x} onOpen={() => onOpen(x)} onMove={(st) => onMove(x, st)} onPickStage={() => onPick(x)} />)
        : <Text variant="small" tone="gray2" center style={s.empty}>{t("aw7.emptyFilter")}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  col: { borderRadius: 22, borderWidth: 1.5, padding: 10, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, paddingTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  fill: { flex: 1 },
  count: { minWidth: 26, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  empty: { paddingVertical: 24 },
});
