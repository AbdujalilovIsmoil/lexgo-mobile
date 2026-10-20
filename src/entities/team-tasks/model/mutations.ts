import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { toast } from "@/shared/ui";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { changeStatus, createTask, deleteTask, patchTask, setAssignees } from "../api/teamTaskApi";
import type { TaskInput, TaskStatus, TeamTask } from "./types";
import { taskKeys } from "./queries";

// A write to a task: on success the lists are fetched again and a toast says what happened; on HTTP 409 (the task changed elsewhere)
// nothing is retried — the task is fetched again, the user is told, and repeats the action by hand; any other error shows the
// server's own message.
function useTaskWrite<V>(fn: (v: V) => Promise<TeamTask | void>, done: (r: TeamTask | void, v: V) => string) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r, v) => {
      successHaptic();
      toast(done(r, v), "ok");
      void qc.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (e) => {
      errorHaptic();
      void qc.invalidateQueries({ queryKey: taskKeys.all });
      if (e instanceof ApiError && e.status === 409) return toast(t("ttm.err.conflictNotice"), "err");
      toast(e instanceof ApiError && e.detail ? e.detail : t("ttm.err.save"), "err");
    },
  });
}

export function useCreateTask() {
  const { t } = useT();
  return useTaskWrite((i: TaskInput) => createTask(i), (r) => t("ttm.createdOk", { code: (r as TeamTask)?.code ?? "" }));
}
export function useEditTask() {
  const { t } = useT();
  return useTaskWrite((v: { task: TeamTask; title: string; description: string; deadlineAt: string }) => patchTask(v.task.id, v.task.lockVersion, {
    ...(v.title !== v.task.title ? { title: v.title } : {}), ...(v.description !== v.task.description ? { description: v.description } : {}), ...(v.deadlineAt ? { deadlineAt: v.deadlineAt } : {}),
  }), (_r, v) => t("ttm.saved", { code: v.task.code }));
}
export function useAssignTask() {
  const { t } = useT();
  return useTaskWrite((v: { task: TeamTask; ids: string[] }) => setAssignees(v.task.id, v.task.lockVersion, v.ids), (_r, v) => t("ttm.saved", { code: v.task.code }));
}
export function useMoveTask() {
  const { t } = useT();
  return useTaskWrite((v: { task: TeamTask; to: TaskStatus; comment?: string }) => changeStatus(v.task.id, v.task.lockVersion, v.to, v.comment ?? ""), (_r, v) =>
    v.comment ? t("ttm.returned", { code: v.task.code }) : t("ttm.moved", { code: v.task.code, status: t(`ttm.status.${v.to}`) }));
}
export function useRemoveTask() {
  const { t } = useT();
  return useTaskWrite((v: { task: TeamTask; reason: string }) => deleteTask(v.task.id, v.task.lockVersion, v.reason), (_r, v) => t("ttm.deletedOk", { code: v.task.code }));
}
