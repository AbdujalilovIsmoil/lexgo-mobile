import { useState } from "react";
import { View } from "react-native";
import { TaskFormSheet } from "@/features/pro-task-form";
import { TaskRow, isDone, useTaskStatus, useTasks, type ProTask } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { EmptyTile, SectionHead } from "./CaseSection";

// Tasks linked to this case (tick, open to edit) and a shortcut to add one prefilled with the case.
export function CaseTasks({ caseId }: { caseId: string }) {
  const { t } = useT();
  const q = useTasks();
  const move = useTaskStatus();
  const [sheet, setSheet] = useState<{ task: ProTask | null } | null>(null);
  const kept = useKept(sheet);
  const rows = (q.data ?? []).filter((x) => x.caseId === caseId);
  return (
    <View style={{ gap: 10 }}>
      <SectionHead title={t("aw5.tab.tasks")} onAdd={() => setSheet({ task: null })} label={t("aw5.addTask")} />
      {rows.length ? rows.map((x) => <TaskRow key={x.id} task={x} onPress={() => setSheet({ task: x })} onToggle={() => move.mutate({ id: x.id, status: isDone(x) ? "todo" : "done" })} />) : <EmptyTile icon="check-square" text={t("aw5.noTasks")} />}
      <TaskFormSheet visible={!!sheet} onClose={() => setSheet(null)} task={kept?.task ?? null} presetCase={caseId} />
    </View>
  );
}
