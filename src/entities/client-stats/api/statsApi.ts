import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { ChatRoom, DocItem, DocsPage, Payment } from "../model/types";

const normDoc = (v: unknown): DocItem => {
  const d = asDict(v);
  return { id: asStr(d.id), title: asStr(d.title), status: asStr(d.status).toLowerCase(), statusLabel: asStr(d.status_label), nextAction: asStr(d.next_action), updatedAt: asStr(d.updated_at), createdAt: asStr(d.created_at) };
};

// GET /document-requests/service-flow — the paged document archive ("Mening hujjatlarim").
// The plain /document-requests list ignores limit/offset, this one honours them and `status`.
export async function fetchDocs(p: { limit: number; offset: number; status?: string }): Promise<DocsPage> {
  const qs = new URLSearchParams({ limit: String(p.limit), offset: String(p.offset) });
  if (p.status) qs.set("status", p.status);
  const d = asDict(await http(`/document-requests/service-flow?${qs.toString()}`));
  const items = listFrom(d, "items", "data").map(normDoc);
  return { items, total: asNum(d.total, items.length) };
}

export const normPayment = (v: unknown): Payment => {
  const d = asDict(v);
  return { id: asStr(d.id), amount: uzs(d, "amount"), currency: asStr(d.currency) || "UZS", status: asStr(d.status).toLowerCase(), kind: asStr(d.kind), description: asStr(d.description), orderId: asStr(d.order_id), createdAt: asStr(d.created_at) };
};

// GET /payments — the client's own payment attempts (the client never marks one paid).
export async function listPayments(): Promise<Payment[]> {
  return listFrom(await http("/payments"), "payments", "items", "data").map(normPayment);
}

// GET /secure-chats — rooms with unread counters; participants carry phones, which stay unread.
export async function listChatRooms(myId: string): Promise<ChatRoom[]> {
  return listFrom(await http("/secure-chats"), "rooms", "items", "data").map((v) => {
    const d = asDict(v);
    const peer = asArr(d.participants).map(asDict).find((p) => asStr(p.user_id) !== myId);
    const last = asDict(d.last_message);
    return { id: asStr(d.id), unread: asNum(d.unread_count), peerName: asStr(peer?.name), peerRole: asStr(peer?.role), lastText: asStr(last.content), lastAt: asStr(d.last_message_at), status: asStr(d.status) };
  });
}
