import { isOpenTask, useDashTasks, useDashUnread, useToday } from "@/entities/admin-hrm";

// Live counters shown on hub tiles (existing queries only): open tasks, unread messages, pending approvals.
export function useHubBadges(): Record<string, number> {
  const tasks = useDashTasks().data;
  const unread = useDashUnread().data;
  const pending = useToday().data?.pendingApprovals;
  return { tasks: (tasks ?? []).filter(isOpenTask).length, messages: unread?.length ?? 0, approvals: pending ?? 0 };
}
