import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { contactBlocked, loadOlder, pushMessages, sendMessage, supKeys, useChat, type SupportMessage } from "@/entities/support";

export type SendResult = "ok" | "failed" | "blocked";

const makeLocal = (ticketId: string, meId: string, content: string, id: string): SupportMessage =>
  ({ id, ticketId, senderUserId: meId, senderName: "", senderRole: "client", messageType: "text", content, attachments: [], createdAt: new Date().toISOString(), state: "sending" });

// Chat of one ticket: the newest page (kept fresh by socket events), older pages on demand and
// optimistic sending — a message shows as "sending" at once and gets a retry link if it fails.
export function useTicketChat(ticketId: string, meId: string) {
  const qc = useQueryClient();
  const query = useChat(ticketId);
  const [local, setLocal] = useState<SupportMessage[]>([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const messages = useMemo(() => [...local, ...(query.data?.items ?? [])], [local, query.data]);
  const hasMore = (query.data?.older ?? 0) > 0;

  const older = useCallback(async () => {
    if (loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    try {
      await loadOlder(qc, ticketId);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMore, qc, ticketId]);

  const send = useCallback(
    async (text: string, retryId?: string): Promise<SendResult> => {
      const body = text.trim();
      if (!body || !ticketId) return "failed";
      const tempId = retryId ?? `local-${Date.now()}`;
      setBlocked(null);
      setLocal((cur) => [makeLocal(ticketId, meId, body, tempId), ...cur.filter((m) => m.id !== tempId)]);
      try {
        const sent = await sendMessage(ticketId, body);
        if (!pushMessages(qc, ticketId, [{ ...sent, senderUserId: sent.senderUserId || meId }])) void qc.invalidateQueries({ queryKey: supKeys.chat(ticketId) });
        setLocal((cur) => cur.filter((m) => m.id !== tempId));
        void qc.invalidateQueries({ queryKey: supKeys.lists });
        return "ok";
      } catch (e) {
        const note = contactBlocked(e);
        if (note !== null) setBlocked(note);
        setLocal((cur) => (note !== null ? cur.filter((m) => m.id !== tempId) : cur.map((m) => (m.id === tempId ? { ...m, state: "failed" as const } : m))));
        return note !== null ? "blocked" : "failed";
      }
    },
    [ticketId, meId, qc],
  );

  return { messages, query, hasMore, loadingOlder, older, send, retry: (m: SupportMessage) => void send(m.content, m.id), blocked };
}
