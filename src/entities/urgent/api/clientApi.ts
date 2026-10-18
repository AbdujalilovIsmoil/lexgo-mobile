import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { UrgentRequest } from "../model/requestTypes";
import { normUrgent } from "./norm";

export type UrgentOrder = { serviceKind: string; channel: string; need: string; region?: string; directions: string[]; lawyerCount?: number };
// POST answer: the record plus — for express / YTX — the call the backend opened for the on-duty advocate.
export type UrgentCreated = { request: UrgentRequest; immediate: boolean; roomId: string; callId: string; message: string };

const rid = (id: string) => encodeURIComponent(id);

// POST /urgent-advokat/requests — files / voice notes go to the secure chat after the advocate takes the case.
export async function createUrgent(o: UrgentOrder): Promise<UrgentCreated> {
  const body: Record<string, unknown> = { service_kind: o.serviceKind, channel: o.channel, need: o.need, directions: o.directions, files: [], voice_messages: [] };
  if (o.region) body.region = o.region;
  if (o.lawyerCount) body.lawyer_count = o.lawyerCount;
  const d = asDict(await http("/urgent-advokat/requests", { method: "POST", body }));
  const request = normUrgent(d.urgent_request && !d.id ? d.urgent_request : d);
  const call = asDict(d.call_session);
  return { request, immediate: d.immediate_call === true || request.immediateCall, roomId: asStr(call.room_id), callId: asStr(call.id), message: asStr(d.message) };
}

// GET /urgent-advokat/requests/me — the full record per row.
export const listMine = async (): Promise<UrgentRequest[]> => listFrom(await http("/urgent-advokat/requests/me"), "items", "data", "requests").map(normUrgent);

// GET /urgent-advokat/requests/{id} — any participant (client, assigned advocate, operator).
export const getRequest = async (id: string): Promise<UrgentRequest> => normUrgent(await http(`/urgent-advokat/requests/${rid(id)}`));

// Cancelling lives under the call-center prefix but the owner may cancel their own request.
export const cancelOwn = ({ id, reason }: { id: string; reason: string }) =>
  http(`/call-center/urgent-advokat/requests/${rid(id)}/cancel`, { method: "POST", body: { reason } });

// POST …/chat/complete — the group chat is finished by an advocate / operator, never by the client.
export const completeChat = ({ id, summary }: { id: string; summary: string }) =>
  http(`/urgent-advokat/requests/${rid(id)}/chat/complete`, { method: "POST", body: { summary } });
