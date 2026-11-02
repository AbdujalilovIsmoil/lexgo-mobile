import { useCallback, useRef, useState } from "react";
import { uploadPurchaseFile } from "@/entities/order";
import { payloadOf, roomFor, type AttachItem } from "./attachLogic";

export type { AttachItem } from "./attachLogic";


type Upload = (f: { uri: string; name: string }) => Promise<{ id: string; name: string }>;

// Files and voice notes for a purchase request: each is uploaded as soon as it is added (so the request itself stays a small JSON),
// shows its own progress / failure with a retry, and can be removed. At most 20 files and 10 voice notes (the backend's limits).
// The request may be sent only when nothing is still uploading; failed items are simply not sent.
export function useAttachments(upload: Upload = uploadPurchaseFile) {
  const [items, setItems] = useState<AttachItem[]>([]);
  const seq = useRef(0);
  const patch = (key: string, p: Partial<AttachItem>) => setItems((list) => list.map((x) => (x.key === key ? { ...x, ...p } : x)));

  const run = useCallback(async (it: AttachItem) => {
    patch(it.key, { state: "uploading" });
    try {
      const r = await upload({ uri: it.uri, name: it.name });
      if (!r.id) throw new Error("no_id");
      patch(it.key, { state: "done", fileId: r.id, name: r.name || it.name });
    } catch {
      patch(it.key, { state: "error" });
    }
  }, [upload]);

  const room = { file: roomFor(items, "file"), voice: roomFor(items, "voice") };

  // Adds what fits under the limit; returns how many were left out.
  const add = (kind: AttachItem["kind"], list: { uri: string; name: string; size?: number; durationMs?: number }[]): number => {
    const take = list.slice(0, Math.max(0, kind === "file" ? room.file : room.voice));
    const made = take.map((f): AttachItem => ({ key: `a${++seq.current}`, kind, name: f.name, uri: f.uri, size: f.size ?? 0, durationMs: f.durationMs ?? 0, state: "uploading", fileId: "" }));
    setItems((cur) => [...cur, ...made]);
    made.forEach((m) => void run(m));
    return list.length - take.length;
  };
  const remove = (key: string) => setItems((list) => list.filter((x) => x.key !== key));
  const retry = (key: string) => { const it = items.find((x) => x.key === key); if (it) void run(it); };
  const reset = () => setItems([]);

  const { attachments, voices } = payloadOf(items);
  const uploading = items.some((x) => x.state === "uploading");
  return { items, add, remove, retry, reset, attachments, voices, uploading, room };
}
