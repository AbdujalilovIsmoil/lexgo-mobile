import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supKeys, supportEventOf } from "@/entities/admin-support";
import { useUserEvents } from "@/shared/realtime";

// Realtime on top of the polling: a `support.*` event of the app's user socket refetches the queue (and the
// open ticket's chat, status and client context) at once (a reconnect re-reads everything: SessionBoundary).
// Polling keeps working if the socket is down.
export function useSupportLive(ticketId = "") {
  const qc = useQueryClient();
  const pending = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents(["support.", "notification.created"], (raw) => {
    const e = supportEventOf(raw);
    if (!e) return;
    pending.current.add(e.ticketId);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const mine = ticketId !== "" && pending.current.has(ticketId);
      pending.current.clear();
      void qc.invalidateQueries({ queryKey: supKeys.queueAll });
      void qc.invalidateQueries({ queryKey: supKeys.counts });
      if (!mine) return;
      for (const key of [supKeys.ticket(ticketId), supKeys.messages(ticketId), supKeys.assist(ticketId)]) void qc.invalidateQueries({ queryKey: key });
    }, 300);
  });
}
