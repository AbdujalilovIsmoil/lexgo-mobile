import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { WS_BASE } from "@/shared/config/env";
import { accessToken, http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { ReconnectingSocket, useUserEvents } from "@/shared/realtime";

type Signal = "call.join" | "call.leave" | "call.end";
type Handlers = { onMeta: () => void; onEnded: () => void };

// Call signalling: /ws/secure-chats/{room}/calls/{call}?token=… relays join / leave / end and the
// participant / media events that change the roster. The user socket's call.* frames feed the same handlers.
export function useCallSocket(roomId: string, callId: string, enabled: boolean, h: Handlers) {
  const ref = useRef(h);
  useEffect(() => { ref.current = h; });
  const sock = useRef<ReconnectingSocket | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const s: ReconnectingSocket = new ReconnectingSocket({
      url: () => {
        const token = accessToken();
        return token ? `${WS_BASE}/ws/secure-chats/${encodeURIComponent(roomId)}/calls/${encodeURIComponent(callId)}?token=${encodeURIComponent(token)}` : null;
      },
      onOpen: () => { s.send({ event: "call.join", payload: {} }); ref.current.onMeta(); },
      onMessage: (data) => {
        const o = asDict(data);
        const type = asStr(o.type ?? o.event);
        if (type === "error" && Number(o.status_code) === 401) { void http("/auth/me").catch(() => undefined).then(() => { s.stop(); s.start(); }); return; }
        if (type.includes("auto_ended") || type === "call.end" || type === "call.ended") ref.current.onEnded();
        // Every call.* frame (participant_joined / _left / _updated, updated, recording_*, extended, paused …) changes the roster or limits.
        else if (/^(participant|media)\./.test(type) || type.startsWith("call.")) ref.current.onMeta();
      },
    });
    sock.current = s;
    s.start();
    const app = AppState.addEventListener("change", (st) => { if (st === "active") { s.nudge(); ref.current.onMeta(); } });
    return () => { app.remove(); s.stop(); sock.current = null; };
  }, [roomId, callId, enabled]);
  useUserEvents("call.", (e) => {
    const id = asStr(e.call_id ?? asDict(e.call).id);
    if (id && id !== callId) return;
    if (e.event === "call.ended") ref.current.onEnded();
    else ref.current.onMeta();
  });
  return (event: Signal) => { sock.current?.send({ event, payload: {} }); };
}
