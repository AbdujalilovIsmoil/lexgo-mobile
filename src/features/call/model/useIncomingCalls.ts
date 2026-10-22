import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import { deviceId } from "@/shared/push";
import { callPath, listInvited, patchParticipant, type Invited } from "@/entities/call";
import { useResync, useSocketState, useUserEvents } from "@/shared/realtime";
import { useSession } from "@/entities/session";
import { alertIncoming, clearIncomingAlert } from "../lib/ringAlert";
import { callIdOf, isOver, NUDGE, parseRing, RING, type Incoming } from "../lib/ringEvent";

export type { Incoming };
const POLL_MS = 8000; // only while the user socket is down
const RING_MS = 45_000; // an unanswered ring stops by itself (still joinable from the meetings list)
const make = (c: Invited): Incoming => ({ roomId: c.roomId, callId: c.callId, type: c.type, callerName: c.callerName, title: c.title });

// Incoming calls / invites: `call.incoming` on the user socket (+ safety nets) and GET /calls/invited on start, foreground, reconnect.
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
      const list = await listInvited();
      const hit = list.find((c) => c.callStatus === "active" && c.status === "invited" && !seen.current.has(c.callId));
      const now = list.find((c) => c.callId === cur.current?.callId);
      const settled = !!now && (now.callStatus !== "active" || now.status !== "invited");
      setInc((c) => (hit ? (c?.callId === hit.callId ? { ...c, callerName: c.callerName || hit.callerName, title: c.title || hit.title } : c ?? make(hit)) : settled ? null : c));
    } catch { /* the next poll tries again */ }
  }, [myId]);

  useEffect(() => {
    void poll();
    const id = online || !myId ? undefined : setInterval(() => void poll(), POLL_MS);
    const app = AppState.addEventListener("change", (s) => { if (s === "active") void poll(); });
    return () => { clearInterval(id); app.remove(); };
  }, [online, myId, poll]);
  useResync(() => void poll());
  useEffect(() => {
    if (!inc) return;
    const id = setTimeout(() => { seen.current.add(inc.callId); setInc(null); clearIncomingAlert(inc.callId); }, RING_MS);
    return () => clearTimeout(id);
  }, [inc]);
  useUserEvents(["call.", ...NUDGE], (e) => {
    if (NUDGE.includes(e.event)) return void poll();
    const id = callIdOf(e);
    if (RING.includes(e.event)) {
      const ring = parseRing(e, myId);
      if (!ring || busy.current || seen.current.has(id)) return;
      setInc(ring); alertIncoming(ring);
      if (!ring.callerName) void poll();
    } else if (id && cur.current?.callId === id && isOver(e)) {
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
