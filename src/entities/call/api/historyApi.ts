import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { AdminCall, AdminCallDetail, Invited } from "../model/historyTypes";
import { normParticipant } from "./normalizeCall";
import { kind, normAdminCall } from "./normalizeAdmin";

// GET /calls/invited — meetings I hosted or was invited to (the host has a participant row too).
export async function listInvited(): Promise<Invited[]> {
  return listFrom(await http("/calls/invited"), "items", "data", "calls")
    .map((v) => {
      const d = asDict(v);
      return {
        roomId: asStr(d.room_id),
        callId: asStr(d.call_id ?? d.id),
        type: kind(d.call_type),
        title: asStr(d.title),
        callerName: asStr(d.caller_name),
        callerId: asStr(d.caller_user_id),
        status: asStr(d.status),
        callStatus: asStr(d.call_status ?? d.status),
        startedAt: asStr(d.started_at),
        autoEndAt: asStr(d.auto_end_at),
      };
    })
    .filter((c) => c.roomId && c.callId);
}

export type AdminCallFilter = { status?: string; userId?: string; roomId?: string; from?: string; to?: string };
// GET /admin/calls — every meeting on the platform (superadmin / leads.manage). No server paging.
export async function listAdminCalls(f: AdminCallFilter = {}): Promise<AdminCall[]> {
  const qs = new URLSearchParams();
  if (f.status) qs.set("status", f.status);
  if (f.userId) qs.set("user_id", f.userId);
  if (f.roomId) qs.set("room_id", f.roomId);
  if (f.from) qs.set("date_from", f.from);
  if (f.to) qs.set("date_to", f.to);
  const q = qs.toString();
  return listFrom(await http(`/admin/calls${q ? `?${q}` : ""}`), "items", "calls", "data").map(normAdminCall);
}

export async function getAdminCall(id: string): Promise<AdminCallDetail> {
  const d = asDict(await http(`/admin/calls/${encodeURIComponent(id)}`));
  const room = asDict(d.room);
  const creator = asDict(d.creator);
  return {
    call: normAdminCall(d.call ?? d),
    roomTitle: asStr(room.title),
    creator: d.creator ? { name: asStr(creator.name), phone: asStr(creator.phone) } : null,
    durationMin: asNum(d.duration_minutes),
    participants: asArr(d.participants).map(normParticipant),
  };
}
