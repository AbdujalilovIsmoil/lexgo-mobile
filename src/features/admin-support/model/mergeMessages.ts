import { serverMs, type SupportMessage } from "@/entities/admin-support";

// Server messages (deduplicated by id) newest first, with local sending/failed ones on top.
export function mergeMessages(server: SupportMessage[], local: SupportMessage[]): SupportMessage[] {
  const byId = new Map<string, SupportMessage>();
  for (const m of server) if (m.id) byId.set(m.id, m);
  const sorted = [...byId.values()].sort((a, b) => serverMs(b.createdAt) - serverMs(a.createdAt) || (a.id < b.id ? 1 : -1));
  return [...local, ...sorted];
}

export function makeLocal(ticketId: string, meId: string, content: string, id: string): SupportMessage {
  return { id, ticketId, senderUserId: meId, senderName: "", senderRole: "operator", messageType: "text", content, attachments: [], createdAt: new Date().toISOString(), state: "sending" };
}
