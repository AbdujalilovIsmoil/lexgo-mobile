import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { Column, Lead } from "../model/types";

const scoreKey = (v: unknown): string => {
  const s = asStr(v).trim().toLowerCase();
  return s === "hot" || s === "warm" || s === "cold" ? s : "";
};

// Contact info lives in `details`; the operator is the lead's own column (older rows kept it in details).
export function normLead(v: unknown): Lead {
  const d = asDict(v);
  const det = asDict(d.details);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    name: asStr(det.name ?? d.name),
    phone: asStr(det.phone ?? d.phone),
    source: asStr(d.source),
    category: asStr(d.category),
    region: asStr(d.region),
    urgency: asStr(d.urgency),
    note: asStr(det.note ?? det.message ?? d.note),
    status: asStr(d.status),
    score: scoreKey(d.score ?? det.score),
    createdAt: asStr(d.created_at),
    details: det,
    assignedTo: asStr(d.assigned_operator_user_id) || asStr(det.assigned_to_user_id),
    assignedAt: asStr(det.assigned_at),
    assignedBy: asStr(det.assigned_by),
    clientUserId: asStr(d.client_user_id) || asStr(det.user_id ?? det.client_user_id ?? det.created_by_user_id),
  };
}

// Board payload → columns ordered by `order`, leads ordered by their position.
export function normColumns(data: unknown): Column[] {
  return listFrom(data, "columns", "items", "data")
    .map((c) => {
      const d = asDict(c);
      const leads = asArr(d.leads).map((x) => ({ lead: normLead(asDict(x).lead ?? x), pos: asNum(asDict(x).position) }));
      return {
        key: asStr(d.key),
        title: asStr(d.title),
        color: asStr(d.color),
        order: asNum(d.order),
        isFinal: Boolean(d.is_final),
        count: asNum(d.count),
        leads: leads.sort((a, b) => a.pos - b.pos).map((x) => x.lead),
      };
    })
    .sort((a, b) => a.order - b.order);
}
