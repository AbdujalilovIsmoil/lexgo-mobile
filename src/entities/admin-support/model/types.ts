export type SupportTab = "new" | "mine" | "transferred" | "closed";
export type CallKind = "audio" | "video";

export type SupportTicket = {
  id: string; workId: string; title: string; description: string; status: string; category: string; priority: string; source: string;
  lastMessage: string; lastMessageAt: string; clientUserId: string; clientName: string; clientLexgoId: string;
  operatorUserId: string; operatorName: string; resolution: string; reopenReason: string; transferReason: string;
  unreadCount: number; createdAt: string; updatedAt: string; closedAt: string;
};

export type SupportAttachment = { name: string; url: string; size: number; mime: string };

export type SupportMessage = {
  id: string; ticketId: string; senderUserId: string; senderName: string; senderRole: string; messageType: string;
  content: string; attachments: SupportAttachment[]; createdAt: string;
  state?: "sending" | "failed"; // local, optimistic messages only
};

export type SupportOperator = { id: string; name: string; lexgoId: string; role: string; status: string };
export type SupportCall = { id: string; roomId: string; workId: string; callType: CallKind };
export type MessagePage = { items: SupportMessage[]; raw: number; total: number; hasMore: boolean; ticket: SupportTicket | null };
