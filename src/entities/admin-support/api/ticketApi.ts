import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { Page } from "@/shared/lib/usePaged";
import type { CallKind, SupportCall, SupportOperator, SupportTicket } from "../model/types";
import { normTicket } from "./normTicket";

const enc = encodeURIComponent;
const cc = (id: string, tail: string) => `/call-center/support/tickets/${enc(id)}/${tail}`;

export type QueueFilter = { status: string; assignedToMe?: boolean };

// GET /call-center/support/tickets — one page of the operator queue.
export async function listQueue(f: QueueFilter, p: { limit: number; offset: number }): Promise<Page<SupportTicket>> {
  const qs = new URLSearchParams({ limit: String(p.limit), offset: String(p.offset), status: f.status });
  if (f.assignedToMe) qs.set("assigned_to_me", "true");
  const raw = await http(`/call-center/support/tickets?${qs}`);
  const items = listFrom(raw, "items", "data", "tickets").map(normTicket);
  const seen = p.offset + items.length;
  const total = Math.max(asNum(asDict(raw).total, seen), seen);
  const more = asDict(raw).has_more;
  return { items, total, hasMore: (typeof more === "boolean" ? more : seen < total) && items.length > 0 };
}

export const getTicket = async (id: string): Promise<SupportTicket> => normTicket(await http(`/support/tickets/${enc(id)}`));
export const claimTicket = async (id: string) => normTicket(await http(cc(id, "claim"), { method: "POST" }));

export async function transferTicket(id: string, operatorUserId: string, reason: string) {
  return normTicket(await http(cc(id, "transfer"), { method: "POST", body: { operator_user_id: operatorUserId, reason } }));
}

export async function closeTicket(id: string, resolution: string) {
  return normTicket(await http(cc(id, "close"), { method: "POST", body: { note: resolution, resolution } }));
}

// Only the ticket's own client may reopen (the backend answers 403 to operators).
export async function reopenTicket(id: string, reason = "") {
  return normTicket(await http(`/support/tickets/${enc(id)}/reopen`, { method: "POST", body: { reason: reason.trim() } }));
}

export async function listOperators(q: string): Promise<SupportOperator[]> {
  const qs = new URLSearchParams({ limit: "30" });
  if (q.trim()) qs.set("q", q.trim());
  return listFrom(await http(`/call-center/support/operators?${qs}`), "items", "data", "operators")
    .map((v) => {
      const x = asDict(v);
      return { id: asStr(x.id ?? x.user_id), name: asStr(x.name ?? x.full_name).trim(), lexgoId: asStr(x.lexgo_id).trim(), role: asStr(x.role).trim(), status: asStr(x.account_status ?? x.status).trim() };
    })
    .filter((o) => o.id);
}

// POST …/calls creates the LiveKit room; the chat screen then joins it by `?join=<callId>`.
export async function startCall(ticketId: string, kind: CallKind, title: string): Promise<SupportCall> {
  const d = asDict(await http(cc(ticketId, "calls"), { method: "POST", body: { call_type: kind, title, max_duration_minutes: 30 } }));
  return { id: asStr(d.id ?? d.call_id), roomId: asStr(d.room_id), workId: asStr(d.work_id), callType: asStr(d.call_type, kind) === "video" ? "video" : "audio" };
}
