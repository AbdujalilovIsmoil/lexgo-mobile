export type SupportTicket = {
  id: string; workId: string; title: string; description: string; status: string; category: string; priority: string; source: string;
  lastMessage: string; lastMessageAt: string; clientUserId: string; operatorUserId: string; operatorName: string;
  resolution: string; reopenReason: string; transferReason: string; unreadCount: number; createdAt: string; updatedAt: string; closedAt: string;
};

export type SupportAttachment = { name: string; url: string; size: number; mime: string };

export type SupportMessage = {
  id: string; ticketId: string; senderUserId: string; senderName: string; senderRole: string; messageType: string;
  content: string; attachments: SupportAttachment[]; createdAt: string;
  state?: "sending" | "failed"; // local, optimistic messages only
};

export type MetaOption = { key: string; label: string };
export type SupportMeta = { categories: MetaOption[]; priorities: MetaOption[] };
export type SupportHours = { open: boolean; days: number[]; start: string; end: string };
export type TicketTab = "active" | "closed";

/** One page of GET …/messages; `raw` counts what the server sent (before dropping empty rows). */
export type MessagePage = { items: SupportMessage[]; raw: number; total: number; hasMore: boolean; ticket: SupportTicket | null };

/** Chat of one ticket (newest first). `older` = how many messages precede the oldest one held. */
export type ChatCache = { items: SupportMessage[]; older: number; ticket: SupportTicket | null };

/** The AI turn sent along with a new ticket so the operator sees the earlier conversation. */
export type HandoffTurn = { q: string; a: string; at: string };

export type NewTicketInput = { message: string; category: string; urgent: boolean; topicPicked: boolean; turns: HandoffTurn[]; aiSessionId: string; role: string; path?: string };
