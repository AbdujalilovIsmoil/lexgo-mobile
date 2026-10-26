import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { WS_BASE } from "@/shared/config/env";
import { accessToken, http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { onBackOnline } from "@/shared/network";
import { closeWhileAway, ReconnectingSocket, type SocketState } from "@/shared/realtime";
import { normMsg, type Msg } from "@/entities/secure-chat";

type Handlers = { onMessage: (m: Msg) => void; onCall: () => void; onState: (s: SocketState) => void; onOpen: (again: boolean) => void };

// /ws/secure-chats/{room}?token=… — pushes secure_message.created and call.* frames of one room. It reconnects at once when the app comes
// back to the front or the network comes back (TZ §7, §15: the history is re-read on open), not after its backoff delay. Closed while the
// app is away (alerts come over the user socket).
export function useRoomSocket(roomId: string, handlers: Handlers): void {
  const ref = useRef(handlers);
  useEffect(() => { ref.current = handlers; });
  useEffect(() => {
    const sock: ReconnectingSocket = new ReconnectingSocket({
      url: () => {
        const token = accessToken();
        return token ? `${WS_BASE}/ws/secure-chats/${encodeURIComponent(roomId)}?token=${encodeURIComponent(token)}` : null;
      },
      onState: (s) => ref.current.onState(s),
      onOpen: (again) => ref.current.onOpen(again),
      onMessage: (data) => {
        const o = asDict(data);
        const ev = asStr(o.event);
        if (ev.startsWith("call.")) return ref.current.onCall();
        // The socket answers an expired token with an error frame instead of closing: refresh via any 401, reopen.
        if (ev === "error") {
          if (Number(o.status_code) === 401) void http("/auth/me").catch(() => undefined).then(() => { sock.stop(); sock.start(); });
          return;
        }
        if (o.message && typeof o.message === "object") ref.current.onMessage(normMsg(o.message));
      },
    });
    sock.start();
    const app = AppState.addEventListener("change", (s) => { if (s === "active") sock.nudge(); });
    const net = onBackOnline(() => sock.nudge());
    const away = closeWhileAway(sock);
    return () => { app.remove(); net(); away(); sock.stop(); };
  }, [roomId]);
}
