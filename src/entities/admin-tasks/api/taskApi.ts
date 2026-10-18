import { http } from "@/shared/api";
import { asArr, asDict, asStr, listFrom } from "@/shared/lib/json";
import type { AdminTask } from "../model/types";

function norm(v: unknown): AdminTask {
  const d = asDict(v);
  return {
    id: asStr(d.id), title: asStr(d.title), description: asStr(d.description), status: asStr(d.status, "todo"), priority: asStr(d.priority, "medium"),
    due: asStr(d.due_date), caseTitle: asStr(d.case_title), assigneeId: asStr(d.assignee_user_id),
    checklist: asArr(d.checklist).map((c) => ({ text: asStr(asDict(c).text ?? asDict(c).title), done: asDict(c).done === true })),
    createdAt: asStr(d.created_at), updatedAt: asStr(d.updated_at),
  };
}

// GET /admin/tasks[?status=&assignee_user_id=] — the workspace tasks of every professional (a plain array; dates are not filtered by the server).
export async function listTasks(f: { status?: string; assignee?: string } = {}): Promise<AdminTask[]> {
  const p = new URLSearchParams();
  if (f.status) p.set("status", f.status);
  if (f.assignee) p.set("assignee_user_id", f.assignee);
  return listFrom(await http(`/admin/tasks${p.size ? `?${p}` : ""}`), "items", "data").map(norm).filter((x) => x.id);
}
