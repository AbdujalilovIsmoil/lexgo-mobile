import { useEffect, useRef, useState } from "react";
import { isBlocked, useTaskStatus, type ProTask, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { selectHaptic, successHaptic } from "@/shared/lib/haptics";

export type Undo = { id: string; prev: string; message: string };

// Every status change of the board (button, swipe, menu): fires the optimistic mutation with a haptic
// and keeps the last move for a few seconds so it can be undone from the inline snackbar.
export function useTaskMoves() {
  const { t } = useT();
  const { mutate } = useTaskStatus();
  const [undo, setUndo] = useState<Undo | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const run = (task: ProTask, status: string, message: string) => {
    if (task.status === status) return;
    successHaptic();
    mutate({ id: task.id, status });
    setUndo({ id: task.id, prev: task.status, message });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setUndo(null), 5000);
  };

  return {
    undo,
    move: (task: ProTask, stage: TaskStage) => run(task, stage, t("aw7.moved", { stage: t(`aw7.tab.${stage}`) })),
    toggleBlocked: (task: ProTask) => (isBlocked(task) ? run(task, "todo", t("aw7.blockedOff")) : run(task, "blocked", t("aw7.blockedOn"))),
    revert: () => {
      if (!undo) return;
      selectHaptic();
      mutate({ id: undo.id, status: undo.prev });
      clearTimeout(timer.current);
      setUndo(null);
    },
  };
}
