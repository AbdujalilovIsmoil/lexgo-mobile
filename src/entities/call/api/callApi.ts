import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import type { Call, CallType, Participant } from "../model/types";
import { normCall, normParticipant } from "./normalizeCall";

const base = (roomId: string, callId = "", tail = "") => `/secure-chats/${encodeURIComponent(roomId)}/calls${callId ? `/${encodeURIComponent(callId)}` : ""}${tail}`;
const post = (path: string, body: unknown = {}) => http(path, { method: "POST", body });

// POST /secure-chats — a room under which the meeting lives (no payment for staff).
export async function createMeetingRoom(clientId: string, sellerId: string): Promise<string> {
  const d = (await http("/secure-chats", { method: "POST", body: { client_user_id: clientId, seller_user_id: sellerId } })) as { id?: string };
  return d?.id ?? "";
}

// POST …/calls — starts a call; participants are invited at once, max 60 minutes for meetings.
export async function startCall(roomId: string, type: CallType, title: string, participantIds: string[] = [], maxMinutes = 0): Promise<Call> {
  const body = { call_type: type, title, ...(participantIds.length ? { participant_user_ids: participantIds } : {}), ...(maxMinutes ? { max_duration_minutes: maxMinutes } : {}) };
  return normCall(await post(base(roomId), body));
}
export const listCalls = async (roomId: string): Promise<Call[]> => listFrom(await http(base(roomId)), "calls", "items", "data").map(normCall);
export const getCall = async (roomId: string, callId: string): Promise<Call> => normCall(await http(base(roomId, callId)));
/** GET …/join-token — the LiveKit url + token and the call's current shape (does not change the roster). */
export const getJoinToken = async (roomId: string, callId: string): Promise<Call> => normCall(await http(base(roomId, callId, "/join-token")));
/** POST /document-requests/{id}/calls/audio — a client rings the advocate of a document request (3 times at most; the 4th is 429). */
export const startDocAudioCall = async (requestId: string): Promise<Call> => normCall(await post(`/document-requests/${encodeURIComponent(requestId)}/calls/audio`, {}));
/** POST …/join — LiveKit credentials for host and invitee alike (409 once the call has ended). */
export const joinCall = async (roomId: string, callId: string): Promise<Call> => normCall(await post(base(roomId, callId, "/join")));
export const leaveCall = async (roomId: string, callId: string): Promise<void> => { await post(base(roomId, callId, "/leave")); };
/** Ends the meeting for everybody (host); falls back to PATCH /calls/{id} like the web. */
export async function endCall(roomId: string, callId: string): Promise<void> {
  try { await post(base(roomId, callId, "/end")); } catch { await http(`/calls/${encodeURIComponent(callId)}`, { method: "PATCH", body: { status: "ended" } }); }
}

type Patch = Partial<{ answered_device_id: string; status: string; role: string; mic_enabled: boolean; camera_enabled: boolean; screen_enabled: boolean }>;
/** PATCH …/participants/{user} — my own mic/camera/status, or the host muting / removing somebody. Answers with the call. */
export async function patchParticipant(roomId: string, callId: string, userId: string, patch: Patch): Promise<Call> {
  return normCall(await http(base(roomId, callId, `/participants/${encodeURIComponent(userId)}`), { method: "PATCH", body: patch }));
}
export const inviteParticipant = async (roomId: string, callId: string, userId: string): Promise<Participant | null> => {
  const d = await post(base(roomId, callId, "/participants"), { user_id: userId, role: "participant" });
  return d ? normParticipant(d) : null;
};
