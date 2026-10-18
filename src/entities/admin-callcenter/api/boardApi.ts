import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { BoardColumn, BoardLead, Operator } from "../model/boardTypes";

export function normLead(v: unknown): BoardLead {
  const d = asDict(v);
  const det = asDict(d.details);
  const score = asStr(d.score ?? det.score).toLowerCase();
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    name: asStr(det.name ?? d.name),
    phone: asStr(det.phone ?? d.phone),
    source: asStr(d.source),
    category: asStr(d.category),
    region: asStr(d.region),
    urgency: asStr(d.urgency),
    score: score === "hot" || score === "warm" || score === "cold" ? score : "",
    createdAt: asStr(d.created_at),
    assignedTo: asStr(d.assigned_operator_user_id) || asStr(det.assigned_to_user_id),
    clientUserId: asStr(d.client_user_id ?? det.user_id ?? det.client_user_id ?? det.created_by_user_id),
    details: det,
  };
}

// GET /call-center/leads/kanban — compact lead board (call-center staff or leads.manage).
export async function getBoard(): Promise<BoardColumn[]> {
  return listFrom(await http("/call-center/leads/kanban"), "columns", "items", "data")
    .map((c) => {
      const d = asDict(c);
      return {
        key: asStr(d.key), title: asStr(d.title), color: asStr(d.color), order: asNum(d.order), isFinal: Boolean(d.is_final), count: asNum(d.count),
        cards: asArr(d.leads).map((x) => normLead(asDict(x).lead ?? x)),
      };
    })
    .sort((a, b) => a.order - b.order);
}

// GET /admin/users (users.manage) → active call-center operators; 403 for everyone else.
export async function listOperators(): Promise<Operator[]> {
  const rows = listFrom(await http("/admin/users?status=active"), "items", "data", "users");
  return rows
    .map(asDict)
    .filter((u) => asStr(u.role) === "call_center" || asArr(u.roles).some((r) => asStr(r) === "call_center" || asStr(r) === "call_center_lawyer"))
    .map((u) => ({ id: asStr(u.id), name: asStr(u.name), phone: asStr(u.phone) }));
}
