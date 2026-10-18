import { useCallback, useRef } from "react";
import { sendMessage, uploadMessage, type Msg, type PickedFile } from "@/entities/secure-chat";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import type { useRoomMessages } from "./useRoomMessages";

type Job = { temp: Msg; req: (progress: (r: number) => void, signal: AbortSignal) => Promise<Msg>; abort?: AbortController };

// Optimistic sending: the bubble appears at once, is replaced by the server row on success and turns into a
// failed bubble (retry / discard) otherwise. Files and voice notes report real upload progress and can be cancelled.
// `onClosed` runs when the server says the room no longer takes messages (409: consultation completed).
export function useSendMessage(roomId: string, myId: string, thread: ReturnType<typeof useRoomMessages>, reply: Msg | null, clearReply: () => void, onClosed: () => void) {
  const { t } = useT();
  const { setOutbox, put } = thread;
  const jobs = useRef(new Map<string, Job>());
  const patch = useCallback((id: string, p: Partial<Msg>) => setOutbox((o) => o.map((x) => (x.id === id ? { ...x, ...p } : x))), [setOutbox]);

  const run = useCallback(async (job: Job) => {
    const id = job.temp.id;
    const ctl = new AbortController();
    jobs.current.set(id, { ...job, abort: ctl });
    setOutbox((o) => [...o.filter((x) => x.id !== id), { ...job.temp, pending: true, failed: false, progress: 0 }]);
    try {
      const m = await job.req((r) => patch(id, { progress: r }), ctl.signal);
      jobs.current.delete(id);
      put(m);
      setOutbox((o) => o.filter((x) => x.id !== id));
    } catch (e) {
      if (!jobs.current.has(id)) return; // discarded while sending
      patch(id, { pending: false, failed: true });
      if (e instanceof ApiError && e.status === 409) onClosed();
      toast(e instanceof ApiError && e.detail ? e.detail : t("admChat.sendFailed"), "err");
    }
  }, [setOutbox, put, patch, t, onClosed]);

  const draft = (over: Partial<Msg>): Msg => ({
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, senderId: myId, sender: null, type: "text", content: "", blocked: false, blockReason: "",
    createdAt: new Date().toISOString(), file: null, urgentId: "", reply: reply ? { id: reply.id, sender: reply.sender, type: reply.type, content: reply.content } : null, replyToId: reply?.id ?? "", ...over,
  });
  const sendText = (text: string) => {
    const body = text.trim();
    const to = reply?.id ?? "";
    if (!body) return;
    clearReply();
    void run({ temp: draft({ content: body }), req: () => sendMessage(roomId, body, to) });
  };
  const sendFile = (file: PickedFile, type: "file" | "voice" = "file") => {
    const to = reply?.id ?? "";
    clearReply();
    const temp = draft({ type, content: file.name, localUri: file.uri, file: { name: file.name, mime: file.mime, size: file.size, path: "" } });
    void run({ temp, req: (onProgress, signal) => uploadMessage(roomId, file, { type, replyToId: to, onProgress, signal }) });
  };
  const retry = (id: string) => { const j = jobs.current.get(id); if (j) void run(j); };
  const discard = (id: string) => {
    jobs.current.get(id)?.abort?.abort();
    jobs.current.delete(id);
    setOutbox((o) => o.filter((x) => x.id !== id));
  };
  return { sendText, sendFile, retry, discard };
}
