import { useRef } from "react";
import { usePathname } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { supKeys, supportEventOf } from "@/entities/admin-support";
import { useSession } from "@/entities/session";
import { tapHaptic } from "@/shared/lib/haptics";
import { useUserEvents } from "@/shared/realtime";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

const QUIET_MS = 3000; // the same event (one per delivery channel) is announced once

// App-wide operator alerts for the user socket: a toast for a new ticket, a ticket transferred to me and a
// client message on one of my open tickets (unless that ticket is the screen already open). Also refreshes the queue.
export function useSupportAlerts(enabled: boolean) {
  const { t } = useT();
  const qc = useQueryClient();
  const meId = useSession()?.user.id ?? "";
  const path = usePathname();
  const last = useRef(new Map<string, number>());
  useUserEvents(["support.", "notification.created"], (raw) => {
    const e = enabled ? supportEventOf(raw) : null;
    if (!e) return;
    void qc.invalidateQueries({ queryKey: supKeys.queueAll });
    void qc.invalidateQueries({ queryKey: supKeys.counts });
    const who = e.ticket?.clientName || e.ticket?.clientLexgoId || "";
    const mine = e.ticket?.operatorUserId === meId;
    const text =
      e.name === "support.ticket_created" ? t("cc6.newTicket", { name: who })
      : e.name === "support.ticket_transferred_to_you" ? t("cc6.transferred", { name: who })
      : e.name === "support.ticket_message" && mine && e.senderUserId !== meId && !path.includes(e.ticketId) ? t("cc6.newMessage", { name: who })
      : "";
    // The same event also arrives wrapped in notification.created (without the ticket): only a toast that is
    // really shown starts the quiet window, so the richer copy is never swallowed by the bare one.
    const key = `${e.name}:${e.ticketId}`;
    const now = Date.now();
    if (!text || now - (last.current.get(key) ?? 0) < QUIET_MS) return;
    last.current.set(key, now);
    tapHaptic();
    toast(text.trim(), "info");
  });
}
