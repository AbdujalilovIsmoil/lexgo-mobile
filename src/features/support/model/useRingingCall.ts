import { useState } from "react";
import { useUserEvents } from "@/shared/realtime";
import { asDict, asStr } from "@/shared/lib/json";
import { supportEventOf, type SupportCall } from "@/entities/support";

const OVER = new Set(["ended", "cancelled", "expired", "missed", "rejected", "failed"]);

// The operator's support call for this ticket (event support.call_created) until it ends or is dismissed.
export function useRingingCall(ticketId: string) {
  const [call, setCall] = useState<SupportCall | null>(null);
  useUserEvents(["support.", "call."], (raw) => {
    const e = supportEventOf(raw);
    if (e?.kind === "call") {
      if (e.ticketId === ticketId && e.call && !OVER.has(e.call.status.toLowerCase())) setCall(e.call);
      return;
    }
    if (!raw.event.startsWith("call.")) return;
    const c = asDict(raw.call);
    const id = asStr(raw.call_id ?? c.id);
    const over = raw.event === "call.ended" || OVER.has(asStr(c.status ?? raw.status).toLowerCase());
    setCall((cur) => (cur && cur.callId === id && over ? null : cur));
  });
  return { call, dismiss: () => setCall(null) };
}
