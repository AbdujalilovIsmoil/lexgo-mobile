// The caller's / callee's view of one call as a single phase, derived from the facts the web contract provides:
// the LiveKit link, the call row (status + roster, kept fresh by the call.* frames of the websocket) and a ring timer.
export type Link = "connecting" | "ringing" | "live" | "reconnecting" | "ended" | "error";
export type Phase = "connecting" | "calling" | "waiting" | "live" | "reconnecting" | "declined" | "missed" | "ended" | "error";
export type PhaseIn = {
  link: Link;
  callStatus: string; // active | scheduled | ended | cancelled | expired
  over: boolean; // call.ended / auto_ended arrived on a socket
  isCaller: boolean;
  others: { status: string }[]; // everybody except me
  hadRemote: boolean; // somebody has been in the room at some point
  timedOut: boolean; // the ring timer ran out
};

/** How long the caller rings before giving up (the callee's card stops itself after 45 s). */
export const RING_TIMEOUT_MS = 60_000;
const OVER = ["ended", "cancelled", "expired"];

export function callPhase(i: PhaseIn): Phase {
  if (i.over || OVER.includes(i.callStatus)) return i.isCaller && !i.hadRemote && i.callStatus === "expired" ? "missed" : "ended";
  if (i.link === "error") return "error";
  if (i.link === "ended") return "ended";
  if (i.link === "connecting") return "connecting";
  if (i.link === "reconnecting") return "reconnecting";
  if (i.link === "live" || i.hadRemote) return "live";
  if (!i.isCaller) return "waiting";
  if (i.others.length > 0 && i.others.every((p) => p.status === "declined")) return "declined";
  return i.timedOut ? "missed" : "calling";
}

/** Caller: nobody picked up — the call must be ended for everybody so the callee's card goes away. */
export const shouldHangUp = (p: Phase): boolean => p === "declined" || p === "missed";
