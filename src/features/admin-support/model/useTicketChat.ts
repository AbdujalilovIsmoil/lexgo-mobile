import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CHAT_PAGE, contactBlocked, listMessages, sendMessage, supKeys, useLatestMessages, type MessagePage, type SupportMessage, type SupportTicket } from "@/entities/admin-support";
import { makeLocal, mergeMessages } from "./mergeMessages";

export type SendResult = "ok" | "failed" | "blocked";

// Chat of one ticket: newest page polled every 5 s, older pages on demand, optimistic sending with retry.
export function useTicketChat(ticket: SupportTicket | null, meId: string) {
  const id = ticket?.id ?? "";
  const clientUserId = ticket?.clientUserId ?? "";
  const qc = useQueryClient();
  const latest = useLatestMessages(id, clientUserId);
  const [older, setOlder] = useState<{ items: SupportMessage[]; raw: number; hasMore: boolean | null }>({ items: [], raw: 0, hasMore: null });
  const [local, setLocal] = useState<SupportMessage[]>([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  const messages = useMemo(() => mergeMessages([...older.items, ...(latest.data?.items ?? [])], local), [older.items, latest.data, local]);
  const hasMore = older.hasMore ?? latest.data?.hasMore ?? false;

  const loadOlder = useCallback(async () => {
    if (!id || loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    try {
      const page = await listMessages(id, { offset: (latest.data?.raw ?? 0) + older.raw, limit: CHAT_PAGE }, clientUserId);
      setOlder((o) => ({ items: [...o.items, ...page.items], raw: o.raw + page.raw, hasMore: page.hasMore }));
    } finally {
      setLoadingOlder(false);
    }
  }, [id, loadingOlder, hasMore, latest.data?.raw, older.raw, clientUserId]);

  const send = useCallback(
    async (text: string, retryId?: string): Promise<SendResult> => {
      const body = text.trim();
      if (!body || !id) return "failed";
      const tempId = retryId ?? `local-${Date.now()}`;
      setBlocked(null);
      setLocal((cur) => [makeLocal(id, meId, body, tempId), ...cur.filter((m) => m.id !== tempId)]);
      try {
        const sent = await sendMessage(id, body, clientUserId);
        qc.setQueryData<MessagePage>(supKeys.messages(id), (old) => (old ? { ...old, raw: old.raw + 1, items: [{ ...sent, senderUserId: sent.senderUserId || meId }, ...old.items.filter((m) => m.id !== sent.id)] } : old));
        setLocal((cur) => cur.filter((m) => m.id !== tempId));
        void qc.invalidateQueries({ queryKey: supKeys.messages(id) });
        return "ok";
      } catch (e) {
        const note = contactBlocked(e);
        if (note !== null) setBlocked(note);
        setLocal((cur) => (note !== null ? cur.filter((m) => m.id !== tempId) : cur.map((m) => (m.id === tempId ? { ...m, state: "failed" as const } : m))));
        return note !== null ? "blocked" : "failed";
      }
    },
    [id, meId, clientUserId, qc],
  );

  return { messages, query: latest, hasMore, loadingOlder, loadOlder, send, retry: (m: SupportMessage) => void send(m.content, m.id), blocked };
}
