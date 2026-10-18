import { useMemo } from "react";
import { isCancelled, useEvents } from "@/entities/pro-calendar";
import { isClosedCase, useCases } from "@/entities/pro-cases";
import { useClients } from "@/entities/pro-clients";
import { useRequestCounts } from "@/entities/pro-requests";
import { isDone, sortTasks, useTasks } from "@/entities/pro-tasks";
import { n, useCabinet, useUnread } from "@/entities/pro-workspace";
import { dayKey, todayKey } from "@/shared/lib/pro/dates";

// Everything the workspace dashboard shows, derived from the real endpoints (counters never invented).
export function useDashModel() {
  const { counts, attention } = useRequestCounts(true);
  const cabinet = useCabinet();
  const events = useEvents();
  const tasks = useTasks();
  const cases = useCases();
  const clients = useClients();
  const unread = useUnread();
  const today = todayKey();
  return useMemo(() => {
    const evs = (events.data ?? []).filter((e) => !isCancelled(e));
    const open = sortTasks((tasks.data ?? []).filter((t) => !isDone(t)));
    return {
      counts, attention, cabinet,
      meetingsToday: evs.filter((e) => dayKey(e.startsAt) === today).length,
      upcoming: evs.filter((e) => dayKey(e.startsAt) >= today).slice(0, 4),
      openTasks: open,
      activeCases: cases.data ? cases.data.filter((c) => !isClosedCase(c.status)).length : n(cabinet.data?.workload, "active_cases"),
      doneCases: (cases.data ?? []).filter((c) => c.status === "completed").length,
      clients: clients.data?.length ?? 0,
      unread: unread.data ?? cabinet.data?.unread ?? 0,
      loading: events.isLoading || tasks.isLoading,
    };
  }, [counts, attention, cabinet, events.data, events.isLoading, tasks.data, tasks.isLoading, cases.data, clients.data, unread.data, today]);
}
export type DashModel = ReturnType<typeof useDashModel>;
