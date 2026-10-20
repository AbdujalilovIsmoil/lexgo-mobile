import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { toIso } from "@/shared/lib/pro/dates";
import { TASK_STATUSES, type HistoryItem, type Person, type TaskFilter, type TaskInput, type TaskMeta, type TaskStats, type TaskStatus, type TeamTask } from "../model/types";

const enc = encodeURIComponent;
const bool = (v: unknown): boolean => v === true;
const status = (v: unknown): TaskStatus => (TASK_STATUSES.includes(asStr(v) as TaskStatus) ? (asStr(v) as TaskStatus) : "new");
function qs(o: Record<string, string | number | undefined>): string {
  const p = Object.entries(o).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${enc(String(v))}`);
  return p.length ? `?${p.join("&")}` : "";
}

export function person(raw: unknown): Person | null {
  const d = asDict(raw);
  const id = asStr(d.id);
  return id ? { id, name: asStr(d.name) || asStr(d.full_name), lexgoId: asStr(d.lexgo_id), role: asStr(d.role) } : null;
}
const people = (v: unknown): Person[] => asArr(v).map(person).filter((p): p is Person => !!p);

export function task(raw: unknown): TeamTask {
  const d = asDict(raw);
  const a = asDict(d.actions);
  return {
    id: asStr(d.id),
    code: asStr(d.task_code),
    title: asStr(d.title),
    description: asStr(d.description),
    status: status(d.status),
    deadlineAt: asStr(d.deadline_at),
    overdue: bool(d.is_overdue),
    creator: person(d.creator),
    assignees: people(d.assignees),
    readyBy: person(d.ready_by),
    readyAt: asStr(d.ready_at),
    lockVersion: asNum(d.lock_version, 0),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
    deletedAt: asStr(d.deleted_at),
    deleteReason: asStr(d.delete_reason),
    actions: { canEdit: bool(a.can_edit), canAssign: bool(a.can_assign), canDelete: bool(a.can_delete), canChangeStatus: bool(a.can_change_status), next: asArr(a.next_statuses).map(status), isAssigned: bool(a.is_assigned) },
  };
}

// GET /task-management — newest updates first; `status_counts` are the server's.
export async function listTasks(f: TaskFilter, limit: number, offset: number): Promise<{ items: TeamTask[]; total: number; hasMore: boolean; counts: Record<TaskStatus, number> }> {
  const d = asDict(await http(`/task-management${qs({ status: f.status, assignee_user_id: f.assignee, q: f.q.trim(), deadline_from: f.from ? toIso(f.from, "00:00") : "", deadline_to: f.to ? toIso(f.to, "23:59") : "", limit, offset })}`));
  const items = asArr(d.items).map(task).filter((t) => t.id);
  const c = asDict(d.status_counts);
  return { items, total: asNum(d.total, items.length), hasMore: d.has_more === true, counts: Object.fromEntries(TASK_STATUSES.map((s) => [s, asNum(c[s], 0)])) as Record<TaskStatus, number> };
}
export const getTask = async (id: string): Promise<TeamTask> => task(await http(`/task-management/${enc(id)}`));
export async function getHistory(id: string): Promise<HistoryItem[]> {
  const d = asDict(await http(`/task-management/${enc(id)}/history`));
  return asArr(d.items).map((x) => {
    const h = asDict(x);
    return { id: asStr(h.id), event: asStr(h.event_type), from: asStr(h.from_status), to: asStr(h.to_status), comment: asStr(h.comment), actor: person(h.actor), createdAt: asStr(h.created_at) };
  });
}
export async function getMeta(): Promise<TaskMeta> {
  const c = asDict(asDict(await http("/task-management/meta")).capabilities);
  return { canCreate: bool(c.create), canAssign: bool(c.assign), canApproveReady: bool(c.approve_ready), canDeleteReady: bool(c.delete_ready) };
}
export async function getStats(): Promise<TaskStats> {
  const d = asDict(await http("/task-management/stats"));
  const p = asDict(d.period_tasks);
  const s = asDict(d.current_snapshot);
  const by = asDict(s.by_status);
  return {
    created: asNum(p.total_created, 0), readyInPeriod: asNum(p.ready_in_period, 0), total: asNum(s.total, 0), active: asNum(s.active_total, 0), ready: asNum(s.ready_total, 0),
    overdue: asNum(s.overdue_total, 0), unassigned: asNum(s.unassigned_total, 0), byStatus: Object.fromEntries(TASK_STATUSES.map((k) => [k, asNum(by[k], 0)])) as Record<TaskStatus, number>,
  };
}
export async function listUsers(q: string): Promise<Person[]> {
  return people((asDict(await http(`/task-management/users${qs({ q: q.trim(), limit: 50, offset: 0 })}`))).items);
}

export const createTask = async (i: TaskInput): Promise<TeamTask> => task(await http("/task-management", { method: "POST", body: { title: i.title, description: i.description, deadline_at: i.deadlineAt, assignee_user_ids: i.assigneeIds } }));
// Only the changed fields, always with the latest lock_version.
export const patchTask = async (id: string, lock: number, p: { title?: string; description?: string; deadlineAt?: string }): Promise<TeamTask> =>
  task(await http(`/task-management/${enc(id)}`, { method: "PATCH", body: { ...(p.title !== undefined ? { title: p.title } : {}), ...(p.description !== undefined ? { description: p.description } : {}), ...(p.deadlineAt ? { deadline_at: p.deadlineAt } : {}), expected_lock_version: lock } }));
export const setAssignees = async (id: string, lock: number, userIds: string[]): Promise<TeamTask> => task(await http(`/task-management/${enc(id)}/assignees`, { method: "PUT", body: { user_ids: userIds, expected_lock_version: lock } }));
export const changeStatus = async (id: string, lock: number, to: TaskStatus, comment = ""): Promise<TeamTask> => task(await http(`/task-management/${enc(id)}/status`, { method: "POST", body: { status: to, comment, expected_lock_version: lock } }));
export const deleteTask = async (id: string, lock: number, reason: string): Promise<void> => {
  await http(`/task-management/${enc(id)}`, { method: "DELETE", body: { reason, expected_lock_version: lock } });
};
