import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { SupportTicket } from "../model/types";

const person = (v: unknown) => {
  const d = asDict(v);
  return asStr(d.name ?? d.full_name ?? d.lawyer_name).trim();
};

// One ticket from any support endpoint (the payload may carry the fields, as on the web).
export function normTicket(v: unknown): SupportTicket {
  const d = asDict(v);
  const p = asDict(d.payload);
  const client = asDict(d.client);
  const op = asDict(d.assigned_operator ?? d.operator);
  const description = asStr(d.description ?? p.description).trim();
  return {
    id: asStr(d.id ?? d.ticket_id),
    workId: asStr(d.work_id ?? p.work_id),
    title: asStr(d.subject ?? d.title).trim(),
    description,
    status: asStr(d.status, "waiting_operator"),
    category: asStr(d.category ?? p.category, "general"),
    priority: asStr(d.priority ?? p.priority, "normal"),
    source: asStr(d.source ?? p.source),
    lastMessage: (asStr(d.last_message) || asStr(p.last_message) || description).trim(),
    lastMessageAt: asStr(d.last_message_at ?? p.last_message_at),
    clientUserId: asStr(d.client_user_id ?? client.id ?? d.owner_user_id),
    clientName: asStr(d.client_name ?? p.client_name).trim() || person(client),
    clientLexgoId: asStr(d.client_lexgo_id ?? p.client_lexgo_id ?? client.lexgo_id),
    operatorUserId: asStr(d.assigned_operator_user_id ?? p.assigned_operator_user_id ?? op.id),
    operatorName: asStr(d.assigned_operator_name ?? p.assigned_operator_name ?? d.operator_name).trim() || person(op),
    resolution: asStr(d.resolution ?? p.resolution ?? p.resolution_note).trim(),
    reopenReason: asStr(d.reopen_reason ?? p.reopen_reason).trim(),
    transferReason: asStr(d.transfer_reason ?? p.transfer_reason).trim(),
    unreadCount: Math.max(0, Math.floor(asNum(d.unread_count ?? p.unread_count, 0))),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at ?? d.created_at),
    closedAt: asStr(d.closed_at ?? p.closed_at),
  };
}
