import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { supportEventOf, type SupportEvent } from "../lib/events";
import { pushMessages } from "./chatCache";
import { supKeys } from "./keys";

// Realtime on top of the REST state: a `support.*` frame of the user socket refreshes the lists and
// unread count, and the open ticket (status, operator, messages). Messages that carry their text are
// placed into the chat at once. After a reconnect everything is read again (TZ 37.6).
export function useSupportLive(ticketId = "", onEvent?: (e: SupportEvent) => void) {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pend = useRef({ ticket: false, chat: false });
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents(["support.", "notification.created"], (raw) => {
    const e = supportEventOf(raw);
    if (!e) return;
    if (ticketId !== "" && e.ticketId === ticketId) {
      pushMessages(qc, ticketId, e.messages);
      pend.current.ticket = true;
      if (e.kind === "message" || e.kind === "created") pend.current.chat = true;
    }
    onEvent?.(e);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const { ticket, chat } = pend.current;
      pend.current = { ticket: false, chat: false };
      void qc.invalidateQueries({ queryKey: supKeys.lists });
      void qc.invalidateQueries({ queryKey: supKeys.unread });
      if (ticket) void qc.invalidateQueries({ queryKey: supKeys.ticket(ticketId) });
      if (chat) void qc.invalidateQueries({ queryKey: supKeys.chat(ticketId) });
    }, 300);
  });
  useResync(() => void qc.invalidateQueries({ queryKey: supKeys.all }));
}
