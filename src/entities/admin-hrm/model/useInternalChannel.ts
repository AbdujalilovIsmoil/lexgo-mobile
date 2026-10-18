import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { WS_BASE } from "@/shared/config/env";
import { accessToken } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { ReconnectingSocket } from "@/shared/realtime";

// WS /internal/ws/{channel}?token=… — a per-resource channel (`task:{id}` pushes the comments and status changes of
// one task while it is open). `onEvent` gets the event name; `onOpen(true)` after a reconnect lets the caller re-read.
export function useInternalChannel(channel: string, onEvent: (event: string) => void, onOpen?: (again: boolean) => void): void {
  const ref = useRef({ onEvent, onOpen });
  useEffect(() => {
    ref.current = { onEvent, onOpen };
  });
  useEffect(() => {
    if (!channel) return;
    const sock = new ReconnectingSocket({
      url: () => {
        const token = accessToken();
        return token ? `${WS_BASE}/internal/ws/${encodeURIComponent(channel)}?token=${encodeURIComponent(token)}` : null;
      },
      pingMs: 25_000,
      onOpen: (again) => ref.current.onOpen?.(again),
      onMessage: (data) => {
        const ev = asStr(asDict(data).event);
        if (ev.startsWith("internal.")) ref.current.onEvent(ev);
      },
    });
    sock.start();
    const app = AppState.addEventListener("change", (s) => s === "active" && sock.nudge());
    return () => {
      app.remove();
      sock.stop();
    };
  }, [channel]);
}
