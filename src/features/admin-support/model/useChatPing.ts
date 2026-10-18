import { useState } from "react";
import { useLatestMessages, type SupportTicket } from "@/entities/admin-support";

// Counts the client's messages that arrive while the operator looks at the assist panel (badge on the Chat tab).
export function useChatPing(ticket: SupportTicket | null, meId: string) {
  const latest = useLatestMessages(ticket?.id ?? "", ticket?.clientUserId ?? "");
  const [mark, setMark] = useState<string | null>(null); // newest message id when the chat was left ("" = none yet)
  const items = latest.data?.items ?? [];
  const idx = mark === null ? 0 : items.findIndex((m) => m.id === mark);
  const fresh = mark === null ? [] : idx === -1 ? (mark === "" ? items : []) : items.slice(0, idx);
  return {
    count: fresh.filter((m) => m.senderUserId !== meId && m.messageType !== "system").length,
    leave: () => setMark(items[0]?.id ?? ""),
    back: () => setMark(null),
  };
}
