export type TaskStatus = "new" | "in_progress" | "testing" | "ready";
export const TASK_STATUSES: TaskStatus[] = ["new", "in_progress", "testing", "ready"];

export type Person = { id: string; name: string; lexgoId: string; role: string };
export type TaskActions = { canEdit: boolean; canAssign: boolean; canDelete: boolean; canChangeStatus: boolean; next: TaskStatus[]; isAssigned: boolean };
export type TeamTask = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadlineAt: string;
  overdue: boolean;
  creator: Person | null;
  assignees: Person[];
  readyBy: Person | null;
  readyAt: string;
  lockVersion: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  deleteReason: string;
  actions: TaskActions;
};
export type HistoryItem = { id: string; event: string; from: string; to: string; comment: string; actor: Person | null; createdAt: string };
export type TaskStats = { created: number; readyInPeriod: number; total: number; active: number; ready: number; overdue: number; unassigned: number; byStatus: Record<TaskStatus, number> };
export type TaskMeta = { canCreate: boolean; canAssign: boolean; canApproveReady: boolean; canDeleteReady: boolean };
// `assignee`: "", "me", "unassigned" or a user id.
export type TaskFilter = { status: TaskStatus | ""; assignee: string; q: string; from: string; to: string };
export const EMPTY_FILTER: TaskFilter = { status: "", assignee: "", q: "", from: "", to: "" };
export type TaskInput = { title: string; description: string; deadlineAt: string; assigneeIds: string[] };
