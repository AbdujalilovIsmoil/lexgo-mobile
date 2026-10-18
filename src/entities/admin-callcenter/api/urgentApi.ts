import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { GroupInput, UrgentRequest } from "../model/urgentTypes";
import { normUrgent } from "./urgentNorm";

const path = (id: string, tail = "") => `/call-center/urgent-advokat/requests/${encodeURIComponent(id)}${tail}`;
const post = async (url: string, body: unknown = {}): Promise<UrgentRequest> => normUrgent(await http(url, { method: "POST", body }));

// GET /call-center/urgent-advokat/requests — the whole pool as a plain list (status is filtered on the device).
export async function listUrgent(f: { kind?: string; channel?: string } = {}): Promise<UrgentRequest[]> {
  const qs = new URLSearchParams();
  if (f.kind) qs.set("service_kind", f.kind);
  if (f.channel) qs.set("channel", f.channel);
  return listFrom(await http(`/call-center/urgent-advokat/requests${qs.size ? `?${qs}` : ""}`), "items", "data", "requests").map(normUrgent);
}

export const getUrgent = async (id: string): Promise<UrgentRequest> => normUrgent(await http(path(id)));
export const claimUrgent = (id: string) => post(path(id, "/claim"));
export const cancelUrgent = ({ id, reason }: { id: string; reason: string }) => post(path(id, "/cancel"), { reason });
export const completeUrgent = ({ id, summary, nextAction }: { id: string; summary: string; nextAction: string }) =>
  post(path(id, "/complete"), { summary, files: [], next_action: nextAction });
export const transferUrgent = ({ id, userId, reason }: { id: string; userId: string; reason: string }) =>
  post(path(id, "/transfer"), { target_lawyer_user_id: userId, reason });

export async function setUrgentStatus({ id, status, note }: { id: string; status: string; note: string }): Promise<UrgentRequest> {
  return normUrgent(await http(path(id, "/status"), { method: "PATCH", body: { status, note } }));
}

// Scheduled time → `scheduled`, none → `in_progress`; the count / direction overrides are sent only when the operator ticked them.
export function assignGroup({ id, input }: { id: string; input: GroupInput }): Promise<UrgentRequest> {
  const body: Record<string, unknown> = { lawyer_user_ids: input.lawyerUserIds };
  if (input.scheduledAt) body.scheduled_at = input.scheduledAt;
  if (input.note) body.note = input.note;
  if (input.allowCount) body.allow_count_override = true;
  if (input.allowDirection) body.allow_direction_mismatch = true;
  return post(path(id, "/assign-group"), body);
}

// POST …/meeting — the 30-minute LiveKit meeting; answers with the call session, not the record.
export async function createUrgentMeeting(id: string): Promise<{ callId: string; roomId: string }> {
  const d = asDict(await http(path(id, "/meeting"), { method: "POST", body: {} }));
  return { callId: asStr(d.id), roomId: asStr(d.room_id) };
}
