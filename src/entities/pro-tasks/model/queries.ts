import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic } from "@/shared/lib/haptics";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { toast } from "@/shared/ui";
import { createTask, deleteTask, listTasks, setTaskStatus, updateTask } from "../api/taskApi";
import type { ProTask, TaskInput } from "./types";

export const taskKeys = { all: ["pro-tasks"] as const };

export const useTasks = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: taskKeys.all, queryFn: listTasks, enabled: authed });
};

const inv = [taskKeys.all];
export const useCreateTask = () =>
  useAdminMutation({ mutationFn: (b: TaskInput & { title: string }) => createTask(b), invalidate: inv, success: "aw7.created" });
export const useUpdateTask = (quiet = false) =>
  useAdminMutation({ mutationFn: ({ id, ...b }: TaskInput & { id: string }) => updateTask(id, b), invalidate: inv, success: quiet ? undefined : "aw7.saved" });
// Status moves are optimistic: the card jumps columns at once, rolls back (with the server's message) on failure,
// and the list is refetched when the call settles. Same feedback as useAdminMutation, minus the success toast.
export const useTaskStatus = () => {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => setTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: taskKeys.all });
      const prev = qc.getQueryData<ProTask[]>(taskKeys.all);
      qc.setQueryData<ProTask[]>(taskKeys.all, (list) => list?.map((x) => (x.id === id ? { ...x, status } : x)));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(taskKeys.all, ctx.prev);
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
};
export const useDeleteTask = () => useAdminMutation({ mutationFn: (id: string) => deleteTask(id), invalidate: inv, success: "aw7.deleted" });
