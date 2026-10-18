import type { CallType } from "@/entities/call";
import type { UserEvent } from "@/shared/realtime";
import { asArr, asDict, asStr } from "@/shared/lib/json";

export type Incoming = { roomId: string; callId: string; type: CallType; callerName: string; title: string };

export const RING = ["call.incoming", "call.invited"];
// Realtime frames that mean "a meeting invite may exist": re-read /calls/invited (the web's safety net).
export const NUDGE = ["document_request.meeting_created", "urgent_advokat.meeting_created", "urgent_advokat.express_call_started"];
const OVER = ["ended", "cancelled", "expired", "completed", "missed"];
const MINE_DONE = ["host", "joined", "left", "declined", "removed"];

export const callIdOf = (e: UserEvent): string => asStr(e.call_id ?? asDict(e.call).id);
/** True when this frame says the call is over (so a ringing card for it must go). */
export const isOver = (e: UserEvent): boolean => e.event === "call.ended" || OVER.includes(asStr(e.status ?? asDict(e.call).status));

/** A ring frame → the card to show, or null when it is not for me (my own call, already joined, not active…). */
export function parseRing(e: UserEvent, myId: string): Incoming | null {
  const call = asDict(e.call);
  const roomId = asStr(e.room_id ?? call.room_id);
  const callId = callIdOf(e);
  if (!roomId || !callId || asStr(e.caller_user_id ?? call.caller_user_id) === myId || asStr(call.status, "active") !== "active") return null;
  const parts = asArr(call.participants).map(asDict);
  const me = parts.find((p) => asStr(p.user_id ?? p.id) === myId);
  if (me && MINE_DONE.includes(asStr(me.status))) return null;
  const host = parts.find((p) => asStr(p.role) === "host");
  return { roomId, callId, type: asStr(call.call_type) === "audio" ? "audio" : "video", callerName: asStr(e.caller_name ?? call.caller_name ?? host?.name), title: asStr(call.title) };
}
