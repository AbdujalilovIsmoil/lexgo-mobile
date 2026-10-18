import { asDict, asStr, uzs } from "@/shared/lib/json";
import type { MarketOrder } from "../model/marketTypes";
import { normOrderExtra } from "./marketExtra";

const ROOM_RE = /\/secure-chats\/([^/?#]+)/;
const clean = (s: string) => s.replace(/\.docx$/i, "").replace(/^[_\s]+/, "").replace(/\s{2,}/g, " ").trim();

// Same reading as normMarketOrder() on the web. The phone numbers the backend
// may include are deliberately not read: the app never shows them.
export function normMarketOrder(v: unknown, clientActions: string[] = []): MarketOrder {
  const d = asDict(v);
  const details = asDict(d.details);
  const lawyer = asDict(d.lawyer);
  const payment = asDict(d.payment);
  const roomId = asStr(d.secure_chat_room_id ?? details.secure_chat_room_id) || (ROOM_RE.exec(asStr(d.chat_url))?.[1] ?? "");
  return {
    id: asStr(d.id ?? d.order_id),
    workId: asStr(d.work_id ?? details.work_id),
    status: asStr(d.status).toLowerCase(),
    paymentStatus: asStr(d.payment_status ?? payment.status).toLowerCase(),
    serviceTitle: clean(asStr(d.service_title ?? details.service_title)),
    price: uzs(d, "price") || uzs(payment, "amount"),
    currency: asStr(d.currency, "UZS") || "UZS",
    note: asStr(details.client_note ?? d.note).trim(),
    preferredChannel: asStr(details.preferred_channel ?? d.preferred_channel).toLowerCase(),
    preferredTime: asStr(details.preferred_time ?? d.preferred_time).trim(),
    lawyerName: asStr(d.lawyer_name ?? lawyer.name).trim(),
    lawyerPublicId: asStr(lawyer.public_id ?? d.lawyer_public_id),
    lawyerUserId: asStr(d.lawyer_user_id ?? lawyer.id),
    roomId,
    canStartChat: d.can_start_chat === true && !!roomId,
    canCreateCall: d.can_create_call === true && !!roomId,
    cancelOffered: !!asStr(d.cancel_url),
    completeOffered: clientActions.includes("complete") && !!asStr(d.complete_url),
    createdAt: asStr(d.created_at),
    requestedAt: asStr(details.requested_at) || asStr(d.created_at),
    paidAt: asStr(payment.status).toLowerCase() === "paid" ? asStr(payment.updated_at) : "",
    updatedAt: asStr(d.updated_at),
    ...normOrderExtra(d, details),
  };
}
