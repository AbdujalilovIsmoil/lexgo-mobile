import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/entities/session";
import { runSessionReset } from "@/shared/lib";
import { connectUserSocket, disconnectUserSocket, kickUserSocket, onResync } from "@/shared/realtime";

// Owns the per-session plumbing: the user WebSocket follows the access token,
// everything cached is dropped when the user/role context changes, and a
// reconnect re-reads what screens show (TZ 5, 37.6, 45.9).
export function SessionBoundary() {
  const qc = useQueryClient();
  const session = useSession();
  const token = session?.token ?? "";
  const context = session ? `${session.user.id}:${session.user.backendRole}` : "";
  const last = useRef(context);

  useEffect(() => {
    if (last.current === context) return;
    last.current = context;
    qc.clear();
    runSessionReset();
  }, [context, qc]);

  useEffect(() => {
    if (token) connectUserSocket(token);
    else disconnectUserSocket();
  }, [token]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => s === "active" && kickUserSocket());
    // One debounced, active-only refetch: a reconnect right after resume must not stack on the focus refetch storm.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = onResync(() => {
      clearTimeout(timer);
      timer = setTimeout(() => void qc.invalidateQueries({ refetchType: "active" }), 1500);
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
      off();
    };
  }, [qc]);

  return null;
}
