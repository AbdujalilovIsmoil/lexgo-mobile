import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { GroupInput } from "../model/types";
import type { UrgentRequest } from "../model/requestTypes";
import { normUrgent } from "./norm";

const path = (id: string, tail = "") => `/call-center/urgent-advokat/requests/${encodeURIComponent(id)}${tail}`;
const post = async (url: string, body: unknown = {}): Promise<UrgentRequest> => normUrgent(await http(url, { method: "POST", body }));

// The record's managing actions (POST /call-center/urgent-advokat/requests/{id}/…): offered only where the backend marks the viewer can_manage.
export const claim = (id: string) => post(path(id, "/claim"));
export const cancel = ({ id, reason }: { id: string; reason: string }) => post(path(id, "/cancel"), { reason });
export const complete = ({ id, summary, nextAction }: { id: string; summary: string; nextAction: string }) => post(path(id, "/complete"), { summary, files: [], next_action: nextAction });
export const transfer = ({ id, userId, reason }: { id: string; userId: string; reason: string }) => post(path(id, "/transfer"), { target_lawyer_user_id: userId, reason });
export const setStatus = async ({ id, status, note }: { id: string; status: string; note: string }): Promise<UrgentRequest> =>
  normUrgent(await http(path(id, "/status"), { method: "PATCH", body: { status, note } }));

// A scheduled time → `scheduled`, none → `in_progress`; the count / direction overrides only when the operator ticked them.
export function assignGroup({ id, input }: { id: string; input: GroupInput }): Promise<UrgentRequest> {
  const body: Record<string, unknown> = { lawyer_user_ids: input.lawyerUserIds };
  if (input.scheduledAt) body.scheduled_at = input.scheduledAt;
  if (input.note) body.note = input.note;
  if (input.allowCount) body.allow_count_override = true;
  if (input.allowDirection) body.allow_direction_mismatch = true;
  return post(path(id, "/assign-group"), body);
}

// POST …/meeting answers with the call session (not the record): the LiveKit meeting, 30 minutes by default.
export async function createMeeting(id: string): Promise<{ callId: string; roomId: string }> {
  const d = asDict(await http(path(id, "/meeting"), { method: "POST", body: {} }));
  return { callId: asStr(d.id), roomId: asStr(d.room_id) };
}
