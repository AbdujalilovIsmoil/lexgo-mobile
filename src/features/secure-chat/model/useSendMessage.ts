import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { REFUSAL_MS, refusalText, sendMessage, uploadMessage, uploadRefusal, type Msg, type PickedFile } from "@/entities/secure-chat";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { uploadQueue } from "./uploadQueue";
import type { useRoomMessages } from "./useRoomMessages";

type Job = { temp: Msg; file?: PickedFile; req: (progress: (r: number) => void, signal: AbortSignal) => Promise<Msg>; abort?: AbortController };

// The next upload starts only while the app is in front: one started in the background fails (iOS) and would only turn into a retry.
const inFront = (): Promise<void> =>
  AppState.currentState !== "background"
    ? Promise.resolve()
    : new Promise((go) => {
        const sub = AppState.addEventListener("change", (s) => {
          if (s !== "active") return;
          sub.remove();
          go();
        });
      });

// The server's own sentence for the other refusals (409 closed room, 403…); a 422 field list is not meant for people.
const serverText = (e: unknown): string => (e instanceof ApiError && !Object.keys(e.fieldErrors).length ? e.detail ?? "" : "");

// Optimistic sending: the bubble appears at once, is replaced by the server row on success and turns into a
// failed bubble (retry / discard) otherwise. Files and voice notes go up one at a time, in the order they were sent (the backend takes
// one file per request): the others wait as "queued" bubbles. Each reports real upload progress and can be cancelled; a file the
// server refuses (type, size, broken, full storage) is explained in the user's language.
// `onClosed` runs when the server says the room no longer takes messages (409: consultation completed).
export function useSendMessage(roomId: string, myId: string, thread: ReturnType<typeof useRoomMessages>, reply: Msg | null, clearReply: () => void, onClosed: () => void) {
  const { t } = useT();
  const { setOutbox, put } = thread;
  const jobs = useRef(new Map<string, Job>());
  const [line] = useState(() => uploadQueue(inFront));
  const patch = useCallback((id: string, p: Partial<Msg>) => setOutbox((o) => o.map((x) => (x.id === id ? { ...x, ...p } : x))), [setOutbox]);

  const run = useCallback(async (job: Job) => {
    const id = job.temp.id;
    const ctl = new AbortController();
    jobs.current.set(id, { ...job, abort: ctl });
    if (job.file) patch(id, { queued: false });
    try {
      const m = await job.req((r) => patch(id, { progress: r }), ctl.signal);
      jobs.current.delete(id);
      put(m);
      setOutbox((o) => o.filter((x) => x.id !== id));
    } catch (e) {
      if (!jobs.current.has(id)) return; // discarded while sending
      const why = job.file ? uploadRefusal(e, job.file) : null;
      patch(id, { pending: false, failed: true, refused: !!why && why.kind !== "quota" }); // a full storage may have room again later
      if (e instanceof ApiError && e.status === 409) onClosed();
      if (why && job.file) toast(refusalText(t, why, [job.file.name]), "err", REFUSAL_MS);
      else toast(serverText(e) || t("admChat.sendFailed"), "err");
    }
  }, [setOutbox, put, patch, t, onClosed]);
  const latest = useRef(run); // an upload that waited in the line runs with the newest texts and callbacks
  useEffect(() => { latest.current = run; });

  // Puts the bubble up (or back, on a retry) as sending; `queued` while an earlier upload is still going.
  const show = (job: Job, queued: boolean) => setOutbox((o) => [...o.filter((x) => x.id !== job.temp.id), { ...job.temp, pending: true, failed: false, refused: false, queued, progress: 0 }]);
  const upload = (job: Job) => {
    const id = job.temp.id;
    jobs.current.set(id, job);
    show(job, !line.idle());
    line.push(id, () => (jobs.current.has(id) ? latest.current(job) : Promise.resolve()));
  };
  const draft = (over: Partial<Msg>): Msg => ({
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, senderId: myId, sender: null, type: "text", content: "", blocked: false, blockReason: "",
    createdAt: new Date().toISOString(), file: null, urgentId: "", reply: reply ? { id: reply.id, sender: reply.sender, type: reply.type, content: reply.content } : null, replyToId: reply?.id ?? "", ...over,
  });
  const sendText = (text: string) => {
    const body = text.trim();
    const to = reply?.id ?? "";
    if (!body) return;
    clearReply();
    const job: Job = { temp: draft({ content: body }), req: () => sendMessage(roomId, body, to) };
    show(job, false);
    void run(job);
  };
  const sendFile = (file: PickedFile, type: "file" | "voice" = "file") => {
    const to = reply?.id ?? "";
    clearReply();
    const temp = draft({ type, content: file.name, localUri: file.uri, file: { name: file.name, mime: file.mime, size: file.size, path: "" } });
    upload({ temp, file, req: (onProgress, signal) => uploadMessage(roomId, file, { type, replyToId: to, onProgress, signal }) });
  };
  const retry = (id: string) => {
    const j = jobs.current.get(id);
    if (!j) return;
    if (j.file) return upload(j); // back to the end of the line
    show(j, false);
    void run(j);
  };
  const discard = (id: string) => {
    line.drop(id); // still waiting: it never starts
    jobs.current.get(id)?.abort?.abort(); // uploading: cancelled, and the next one starts
    jobs.current.delete(id);
    setOutbox((o) => o.filter((x) => x.id !== id));
  };
  return { sendText, sendFile, retry, discard };
}
