import { useEffect, useRef, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { nudgeUserSocket, retainUserSocket, subscribeUserEvents, subscribeUserSocketState, userSocketState, type UserEvent } from "./userSocket";
import type { SocketState } from "./reconnectingSocket";

/** Holds the user socket open while `enabled` (signed in) and mirrors its state; reconnects on foreground. */
export function useUserSocket(enabled: boolean): SocketState {
  const state = useSyncExternalStore(subscribeUserSocketState, userSocketState, () => "offline" as SocketState);
  useEffect(() => {
    if (!enabled) return;
    const release = retainUserSocket();
    const app = AppState.addEventListener("change", (s) => { if (s === "active") nudgeUserSocket(); });
    return () => { release(); app.remove(); };
  }, [enabled]);
  return enabled ? state : "offline";
}

/** Subscribes to user-socket events for the life of the component (latest handler always called). */
export function useUserEvents(handler: (e: UserEvent) => void): void {
  const ref = useRef(handler);
  useEffect(() => { ref.current = handler; });
  useEffect(() => subscribeUserEvents((e) => ref.current(e)), []);
}
