import type { CallType } from "@/entities/call";
import type { UserEvent } from "@/shared/realtime";
import { asArr, asDict, asStr } from "@/shared/lib/json";

export type Incoming = { roomId: string; callId: string; type: CallType; callerName: string; title: string };

export const RING = ["call.incoming", "call.invited", "call.ringing"];
// Realtime frames that mean "a meeting invite may exist": re-read /calls/invited (the web's safety net).
export const NUDGE = ["document_request.meeting_created", "urgent_advokat.meeting_created", "urgent_advokat.express_call_started"];
// A call in one of these states is over. `declined` / `rejected` are here for the call itself (a one-to-one call the other side
// refused); `isOver` reads frames whose `status` may be another participant's, so it uses the call-only list.
const OVER = ["ended", "cancelled", "canceled", "expired", "completed", "missed", "declined", "failed", "rejected", "timeout", "timed_out"];
const CALL_OVER = ["ended", "cancelled", "canceled", "expired", "completed", "missed", "timeout", "timed_out"];
// What I already did with the call: it no longer rings for me.
export const MINE_DONE = ["host", "joined", "left", "declined", "removed"];

/**
 * Whether a call in this state may ring. Only a finished call (or a meeting set for later) does not: the backend's call life cycle
 * has more states than "active" (a call can be ringing before anyone joins), and an unknown one must not silence a real call.
 */
export const ringable = (callStatus: string): boolean => {
  const s = callStatus.toLowerCase();
  return !OVER.includes(s) && s !== "scheduled";
};

export const callIdOf = (e: UserEvent): string => asStr(e.call_id ?? asDict(e.call).id);
/** True when this frame says the call is over (so a ringing card for it must go). */
export const isOver = (e: UserEvent): boolean => e.event === "call.ended" || CALL_OVER.includes(asStr(e.call_status ?? e.status ?? asDict(e.call).status).toLowerCase());

/** A ring arrives bare (`call.incoming`) or wrapped in `notification.created` (its data carries the call); the ring frame, or null. */
export function ringFrameOf(e: UserEvent): UserEvent | null {
  if (RING.includes(e.event)) return e;
  if (e.event !== "notification.created") return null;
  const n = asDict(e.notification ?? e);
  const data = asDict(n.data ?? n.meta);
  const name = asStr(data.event ?? data.type);
  return RING.includes(name) ? { ...data, event: name } : null;
}

/** Why a ring frame does not ring for me ("" when it does): for the connection journal. */
export function ringSkip(e: UserEvent, myId: string): string {
  const call = asDict(e.call);
  if (!asStr(e.room_id ?? call.room_id ?? e.secure_chat_room_id) || !callIdOf(e)) return "no room/call id";
  if (asStr(e.caller_user_id ?? call.caller_user_id) === myId) return "my own call";
  const status = asStr(call.status ?? e.call_status);
  if (!ringable(status)) return `call ${status}`;
  const me = asArr(call.participants).map(asDict).find((p) => asStr(p.user_id ?? p.id) === myId);
  if (me && MINE_DONE.includes(asStr(me.status))) return `me ${asStr(me.status)}`;
  return "";
}

/** A ring frame → the card to show, or null when it is not for me (my own call, already joined, over…). */
export function parseRing(e: UserEvent, myId: string): Incoming | null {
  if (ringSkip(e, myId)) return null;
  const call = asDict(e.call);
  const host = asArr(call.participants).map(asDict).find((p) => asStr(p.role) === "host");
  return {
    roomId: asStr(e.room_id ?? call.room_id ?? e.secure_chat_room_id),
    callId: callIdOf(e),
    type: asStr(call.call_type ?? e.call_type) === "audio" ? "audio" : "video",
    callerName: asStr(e.caller_name ?? call.caller_name ?? host?.name),
    title: asStr(call.title ?? e.title),
  };
}
