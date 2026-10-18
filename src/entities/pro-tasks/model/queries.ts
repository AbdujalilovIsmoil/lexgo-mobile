import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createTask, deleteTask, listTasks, setTaskStatus, updateTask } from "../api/taskApi";
import type { TaskInput } from "./types";

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
export const useTaskStatus = () =>
  useAdminMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => setTaskStatus(id, status), invalidate: inv });
export const useDeleteTask = () => useAdminMutation({ mutationFn: (id: string) => deleteTask(id), invalidate: inv, success: "aw7.deleted" });
