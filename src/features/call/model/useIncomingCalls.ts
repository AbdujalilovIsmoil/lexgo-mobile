import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import { deviceId } from "@/shared/push";
import { netLog, serverNow } from "@/shared/network";
import { callPath, listInvited, patchParticipant, type Invited } from "@/entities/call";
import { useResync, useSocketState, useUserEvents } from "@/shared/realtime";
import { useSession } from "@/entities/session";
import { alertIncoming, clearIncomingAlert } from "../lib/ringAlert";
import { callIdOf, isOver, MINE_DONE, NUDGE, parseRing, ringable, ringFrameOf, ringSkip, type Incoming } from "../lib/ringEvent";

export type { Incoming };
const POLL_MS = 8000; // while the user socket is down
const SAFETY_MS = 30_000; // while it is up: the socket rings at once; this only catches a ring it lost (every 6 s kept the radio awake for good)
const RING_MS = 45_000; // an unanswered ring stops by itself (still joinable from the meetings list)
const make = (c: Invited): Incoming => ({ roomId: c.roomId, callId: c.callId, type: c.type, callerName: c.callerName, title: c.title });
const FRESH_MS = 3 * 60_000;
const short = (id: string) => id.slice(0, 8);
// A call I am invited to still rings from the list (as before); one in a newer participant state ("ringing", …) only while it is new,
// so a long meeting I never joined does not ring at every launch.
const ringsFromList = (c: Invited, myId: string): boolean =>
  ringable(c.callStatus) && !MINE_DONE.includes(c.status) && (!!c.status || (!!c.callerId && c.callerId !== myId)) && (c.status === "invited" || !c.startedAt || serverNow() - Date.parse(c.startedAt) < FRESH_MS);

// Incoming calls / invites, on whatever screen the person is: `call.incoming` on the user socket (bare or wrapped in a
// notification), a ring handed over by a push while the app is open, and GET /calls/invited — on start, on foreground, after a
// reconnect, and as a light safety net every few seconds while the app is open. Each decision goes to the connection journal.
export function useIncomingCalls(inCall: boolean) {
  const router = useRouter();
  const myId = useSession()?.user.id ?? "";
  const online = useSocketState() === "online";
  const [inc, setInc] = useState<Incoming | null>(null);
  const seen = useRef(new Set<string>());
  const busy = useRef(inCall);
  const cur = useRef<Incoming | null>(null);
  useEffect(() => { busy.current = inCall; cur.current = inc; });
  const poll = useCallback(async () => {
    if (!myId || busy.current || AppState.currentState !== "active") return;
    try {
      const list = await listInvited(5);
      const hit = list.find((c) => ringsFromList(c, myId) && !seen.current.has(c.callId));
      const now = list.find((c) => c.callId === cur.current?.callId);
      const settled = !!now && (!ringable(now.callStatus) || MINE_DONE.includes(now.status));
      if (hit && cur.current?.callId !== hit.callId) netLog("call", `poll ${short(hit.callId)} call=${hit.callStatus} me=${hit.status} -> ring`);
      setInc((c) => (hit ? (c?.callId === hit.callId ? { ...c, callerName: c.callerName || hit.callerName, title: c.title || hit.title } : c ?? make(hit)) : settled ? null : c));
    } catch { /* the next poll tries again */ }
  }, [myId]);

  useEffect(() => {
    void poll();
    const id = myId ? setInterval(() => void poll(), online ? SAFETY_MS : POLL_MS) : undefined;
    const app = AppState.addEventListener("change", (s) => { if (s === "active") void poll(); });
    return () => { clearInterval(id); app.remove(); };
  }, [online, myId, poll]);
  useResync(() => void poll());
  useEffect(() => {
    if (!inc) return;
    const id = setTimeout(() => { seen.current.add(inc.callId); setInc(null); clearIncomingAlert(inc.callId); }, RING_MS);
    return () => clearTimeout(id);
  }, [inc]);
  useUserEvents(["call.", "notification.created", ...NUDGE], (e) => {
    if (NUDGE.includes(e.event)) return void poll();
    const frame = ringFrameOf(e);
    if (frame) {
      const id = callIdOf(frame);
      const skip = ringSkip(frame, myId) || (busy.current ? "in a call" : seen.current.has(id) ? "already handled" : cur.current?.callId === id ? "already ringing" : "");
      netLog("call", `${e.event === frame.event ? frame.event : `${e.event}/${frame.event}`} ${short(id)} -> ${skip ? `skip (${skip})` : "ring"}`);
      const ring = skip ? null : parseRing(frame, myId);
      if (!ring) return;
      setInc(ring); alertIncoming(ring);
      if (!ring.callerName) void poll();
      return;
    }
    if (e.event === "notification.created") return;
    const id = callIdOf(e);
    if (id && cur.current?.callId === id && isOver(e)) {
      netLog("call", `${e.event} ${short(id)} -> ring stops`);
      seen.current.add(id); setInc(null); clearIncomingAlert(id);
    }
  });

  const answer = (decline: boolean) => {
    if (!inc) return;
    seen.current.add(inc.callId); setInc(null); clearIncomingAlert(inc.callId);
    // The backend stops the ringing on this person's OTHER devices and leaves this one out, so it is told which device answered.
    if (decline) void deviceId().then((d) => patchParticipant(inc.roomId, inc.callId, myId, { status: "declined", ...(d ? { answered_device_id: d } : {}) })).catch(() => undefined);
    else router.push(callPath(inc.roomId, inc.callId) as never);
  };
  return { inc, accept: () => answer(false), decline: () => answer(true) };
}
