import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePaged } from "@/shared/lib/usePaged";
import { todayKey } from "@/shared/lib/pro/dates";
import { useResync, useUserEvents } from "@/shared/realtime";
import { getHistory, getMeta, getStats, getTask, listTasks, listUsers } from "../api/teamTaskApi";
import type { TaskFilter } from "./types";

export const taskKeys = { all: ["team-tasks"] as const };

export function useTeamTasks(f: TaskFilter) {
  const { items, total, query } = usePaged([...taskKeys.all, "list", f], ({ limit, offset }) => listTasks(f, limit, offset).then((r) => ({ items: r.items, total: r.total, hasMore: r.hasMore, counts: r.counts })), { pageSize: 30 });
  // The status counts are the first page's (the server sends them with every page, for the filters except the status itself).
  const counts = (query.data?.pages[0] as { counts?: Record<string, number> } | undefined)?.counts;
  return { items, total, counts, query };
}
export const useTeamTask = (id: string) => useQuery({ queryKey: [...taskKeys.all, "one", id], queryFn: () => getTask(id), enabled: !!id });
export const useTaskHistory = (id: string) => useQuery({ queryKey: [...taskKeys.all, "history", id], queryFn: () => getHistory(id), enabled: !!id });
export const useTaskMeta = () => useQuery({ queryKey: [...taskKeys.all, "meta"], queryFn: getMeta, staleTime: 5 * 60_000 });
export const useTaskStats = () => useQuery({ queryKey: [...taskKeys.all, "stats"], queryFn: () => getStats(todayKey()) });
export const useTaskUsers = (q: string, enabled: boolean) => useQuery({ queryKey: [...taskKeys.all, "users", q], queryFn: () => listUsers(q), enabled, staleTime: 60_000 });

// The socket's task events are only a signal: the list, the open task and the numbers are fetched again (never patched from the event),
// and once more after every reconnect.
export function useTaskLive(): void {
  const qc = useQueryClient();
  const refresh = () => void qc.invalidateQueries({ queryKey: taskKeys.all });
  useUserEvents("tasks.", refresh);
  useResync(refresh);
}
