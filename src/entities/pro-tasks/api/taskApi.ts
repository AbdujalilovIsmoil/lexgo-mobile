import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { CheckItem, ProTask, TaskInput } from "../model/types";

function normItem(v: unknown): CheckItem {
  if (typeof v === "string") return { text: v, done: false };
  const d = asDict(v);
  return { text: asStr(d.text ?? d.title ?? d.label), done: Boolean(d.done ?? d.checked ?? d.completed) };
}

export function normTask(v: unknown): ProTask {
  const d = asDict(v);
  const p = asDict(d.payload);
  const list = Array.isArray(d.checklist) ? d.checklist : Array.isArray(p.checklist) ? p.checklist : [];
  return {
    id: asStr(d.id),
    title: asStr(d.title ?? d.name),
    status: asStr(d.status, "todo").toLowerCase(),
    priority: asStr(d.priority ?? p.priority, "medium").toLowerCase(),
    dueDate: asStr(d.due_date ?? d.deadline ?? p.due_date).slice(0, 10),
    caseId: asStr(d.case_id ?? p.case_id),
    caseTitle: asStr(d.case_title ?? p.case_title),
    description: asStr(d.description ?? p.description),
    checklist: list.map(normItem).filter((c) => c.text),
    updatedAt: asStr(d.updated_at ?? d.created_at),
  };
}

// GET /tasks/me — the signed-in user's own tasks (plain array, no paging).
export async function listTasks(): Promise<ProTask[]> {
  return listFrom(await http("/tasks/me"), "items", "data", "tasks").map(normTask);
}
export const createTask = async (body: TaskInput & { title: string }): Promise<ProTask> => normTask(await http("/tasks", { method: "POST", body }));
export const updateTask = async (id: string, body: TaskInput): Promise<ProTask> => normTask(await http(`/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body }));
export const setTaskStatus = async (id: string, status: string): Promise<ProTask> => normTask(await http(`/tasks/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } }));
export async function deleteTask(id: string): Promise<void> {
  await http(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}
