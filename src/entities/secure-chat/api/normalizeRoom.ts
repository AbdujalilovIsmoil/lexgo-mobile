import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { LastMessage, Member, Room } from "../model/types";

export function normLast(v: unknown): LastMessage | null {
  if (!v || typeof v !== "object") return null;
  const d = asDict(v);
  const sender = asDict(d.sender);
  return {
    id: asStr(d.id),
    senderId: asStr(d.sender_user_id ?? d.sender_id),
    senderName: asStr(d.sender_name ?? sender.name),
    type: asStr(d.message_type, "text"),
    content: asStr(d.filtered_content ?? d.content),
    createdAt: asStr(d.created_at),
    mine: d.is_mine === true,
  };
}

const normMember = (v: unknown): Member => {
  const d = asDict(v);
  return { userId: asStr(d.user_id ?? d.id), name: asStr(d.name), role: asStr(d.role), phone: asStr(d.phone) };
};

// One row of GET /secure-chats (participants, last message and unread count come with it).
export function normRoom(v: unknown): Room {
  const d = asDict(v);
  const members = asArr(d.participants).map(normMember);
  const last = normLast(d.last_message);
  const created = asStr(d.created_at);
  const ids = (list: unknown) => asArr(list).map((x) => asStr(x)).filter(Boolean);
  const urgentIds = ids(d.urgent_advokat_request_ids);
  return {
    id: asStr(d.id),
    status: asStr(d.status, "active"),
    orderId: asStr(d.order_id),
    caseId: asStr(d.case_id),
    urgent: urgentIds.length > 0,
    urgentIds,
    docIds: ids(d.document_lawyer_request_ids),
    activeRecordId: asStr(d.active_record_id),
    clientId: asStr(d.client_user_id),
    sellerId: asStr(d.seller_user_id),
    members,
    memberCount: asNum(d.participant_count, members.length),
    last,
    unread: Math.max(0, asNum(d.unread_count)),
    lastReadAt: asStr(d.last_read_at),
    ttlHours: asNum(d.auto_delete_hours),
    archivedUntil: asStr(d.archived_until),
    updatedAt: asStr(d.last_message_at) || asStr(d.updated_at) || created,
    createdAt: created,
  };
}
