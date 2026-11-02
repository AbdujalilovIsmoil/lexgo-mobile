import { MAX_ATTACHMENTS, MAX_VOICES, type PurchaseAttachment, type PurchaseVoice } from "@/entities/order/api/purchaseApi";

export type AttachItem = {
  key: string;
  kind: "file" | "voice";
  name: string;
  uri: string;
  size: number;
  durationMs: number;
  state: "uploading" | "done" | "error";
  fileId: string;
};

// How many more of a kind fit under the backend's limits (20 files, 10 voice notes).
export const roomFor = (items: Pick<AttachItem, "kind">[], kind: AttachItem["kind"]): number =>
  Math.max(0, (kind === "file" ? MAX_ATTACHMENTS : MAX_VOICES) - items.filter((x) => x.kind === kind).length);

// What the request carries: only the uploaded items, by their file ids (failed and unfinished ones are left out).
export function payloadOf(items: AttachItem[]): { attachments: PurchaseAttachment[]; voices: PurchaseVoice[] } {
  const done = items.filter((x) => x.state === "done" && x.fileId);
  return {
    attachments: done.filter((x) => x.kind === "file").map((x) => ({ file_id: x.fileId, name: x.name })),
    voices: done.filter((x) => x.kind === "voice").map((x) => ({ file_id: x.fileId, duration_ms: x.durationMs })),
  };
}

