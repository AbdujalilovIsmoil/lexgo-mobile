export type DocItem = { id: string; title: string; status: string; statusLabel: string; nextAction: string; updatedAt: string; createdAt: string };
export type DocsPage = { items: DocItem[]; total: number };
export type Payment = { id: string; amount: number; currency: string; status: string; kind: string; description: string; orderId: string; createdAt: string };
// A secure chat room the client is in; `peer` is the other participant (name and role only).
export type ChatRoom = { id: string; unread: number; peerName: string; peerRole: string; lastText: string; lastAt: string; status: string };
