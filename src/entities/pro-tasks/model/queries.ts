import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { isOnline } from "@/shared/network";
import { queueCreate, queueStatus, queueUpdate, isLocalId, newLocalId } from "./offline";
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

// Offline = no connection reported, or the request never reached the server (status 0). Then the change is queued
// (shared/cache outbox), shown at once, and sent when the connection returns.
const unreachable = (e: unknown): boolean => e instanceof ApiError && e.status === 0;
const NOW = () => new Date().toISOString();

export const useCreateTask = () => {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: async (b: TaskInput & { title: string }): Promise<{ queued: boolean }> => {
      if (isOnline()) {
        try {
          await createTask(b);
          return { queued: false };
        } catch (e) {
          if (!unreachable(e)) throw e;
        }
      }
      const id = newLocalId();
      if (!(await queueCreate(id, b))) throw new ApiError(0, "network_error");
      const local: ProTask = { id, title: b.title, status: "todo", priority: b.priority ?? "medium", dueDate: (b.due_date ?? "").slice(0, 10), caseId: b.case_id ?? "", caseTitle: b.case_title ?? "", description: b.description ?? "", checklist: b.checklist ?? [], updatedAt: NOW() };
      qc.setQueryData<ProTask[]>(taskKeys.all, (list) => [local, ...(list ?? [])]);
      return { queued: true };
    },
    onSuccess: ({ queued }) => {
      successHaptic();
      toast(t(queued ? "nt3.net.savedLocal" : "aw7.created"), queued ? "info" : "ok");
      if (!queued) void qc.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail && e.status !== 0 ? e.detail : t("adm.actionFailed"), "err");
    },
  });
};

export const useUpdateTask = (quiet = false) => {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: async ({ id, ...b }: TaskInput & { id: string }): Promise<{ queued: boolean }> => {
      if (isOnline() && !isLocalId(id)) {
        try {
          await updateTask(id, b);
          return { queued: false };
        } catch (e) {
          if (!unreachable(e)) throw e;
        }
      }
      if (!(await queueUpdate(id, b))) throw new ApiError(0, "network_error");
      qc.setQueryData<ProTask[]>(taskKeys.all, (list) => list?.map((x) => (x.id === id ? applyInput(x, b) : x)));
      return { queued: true };
    },
    onSuccess: ({ queued }) => {
      successHaptic();
      if (queued) toast(t("nt3.net.savedLocal"), "info");
      else {
        if (!quiet) toast(t("aw7.saved"), "ok");
        void qc.invalidateQueries({ queryKey: taskKeys.all });
      }
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail && e.status !== 0 ? e.detail : t("adm.actionFailed"), "err");
    },
  });
};

function applyInput(x: ProTask, b: TaskInput): ProTask {
  return {
    ...x,
    ...(b.title !== undefined ? { title: b.title } : null),
    ...(b.priority !== undefined ? { priority: b.priority } : null),
    ...(b.due_date !== undefined ? { dueDate: (b.due_date ?? "").slice(0, 10) } : null),
    ...(b.case_id !== undefined ? { caseId: b.case_id ?? "" } : null),
    ...(b.case_title !== undefined ? { caseTitle: b.case_title } : null),
    ...(b.description !== undefined ? { description: b.description } : null),
    ...(b.checklist !== undefined ? { checklist: b.checklist } : null),
  };
}

// Status moves are optimistic: the card jumps columns at once. Online, a failure rolls back with the server's
// message; offline (or unreachable) the move is queued and stays on screen with a "waiting to sync" mark.
export const useTaskStatus = () => {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (isOnline() && !isLocalId(id)) {
        try {
          await setTaskStatus(id, status);
          return { queued: false };
        } catch (e) {
          if (!unreachable(e)) throw e;
        }
      }
      if (!(await queueStatus(id, status))) throw new ApiError(0, "network_error");
      return { queued: true };
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: taskKeys.all });
      const prev = qc.getQueryData<ProTask[]>(taskKeys.all);
      qc.setQueryData<ProTask[]>(taskKeys.all, (list) => list?.map((x) => (x.id === id ? { ...x, status } : x)));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(taskKeys.all, ctx.prev);
      errorHaptic();
      toast(e instanceof ApiError && e.detail && e.status !== 0 ? e.detail : t("adm.actionFailed"), "err");
    },
    onSuccess: ({ queued }) => {
      if (queued) toast(t("nt3.net.savedLocal"), "info");
    },
    // A queued change is not refetched here: the server does not have it yet and would overwrite the optimistic card.
    onSettled: (r) => {
      if (!r?.queued) void qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};
export const useDeleteTask = () => useAdminMutation({ mutationFn: (id: string) => deleteTask(id), invalidate: inv, success: "aw7.deleted" });
