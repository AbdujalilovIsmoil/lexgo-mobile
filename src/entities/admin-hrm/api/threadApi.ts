import { hrmListAll } from "./opsAll";
import { normMessage } from "./normWork";
import type { Message } from "../model/typesWork";

// The conversation with one colleague: every direct message I sent them or got from them, oldest first.
// (GET /internal/me/messages has no peer filter, so all my messages are read page by page and cut here.)
export async function getThread(peerId: string): Promise<Message[]> {
  const rows = await hrmListAll("/me/messages", {});
  return rows
    .map(normMessage)
    .filter((m) => m.threadType === "direct" && (m.senderId === peerId || m.recipientId === peerId) && !!m.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
