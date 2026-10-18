import { asDict, asStr, uzs } from "@/shared/lib/json";
import { cleanTitle } from "../lib/title";
import type { MktOrder, MktPayment, MktPerson } from "../model/types";

const ROOM_RE = /\/secure-chats\/([^/?#]+)/;
export const low = (v: unknown) => asStr(v).trim().toLowerCase();
const join = (...p: unknown[]) => p.map((x) => asStr(x).trim()).filter(Boolean).join(" ");

export function normPerson(v: unknown, fb: { id: unknown; name: unknown }): MktPerson {
  const d = asDict(v);
  return {
    id: asStr(d.id ?? fb.id),
    lexgoId: asStr(d.lexgo_id),
    role: low(d.role),
    name: asStr(d.name ?? fb.name).trim() || join(d.first_name, d.last_name),
    phone: asStr(d.phone).trim(),
    accountStatus: low(d.account_status),
  };
}

function normPayment(v: unknown): MktPayment | null {
  const d = asDict(v);
  if (!Object.keys(d).length) return null;
  return {
    workId: asStr(d.work_id),
    provider: low(d.provider),
    status: low(d.status),
    amount: uzs(d, "amount"),
    paidAmount: uzs(d, "paid_amount"),
    currency: asStr(d.currency, "UZS") || "UZS",
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
  };
}

export function normOrder(v: unknown): MktOrder {
  const d = asDict(v);
  const det = asDict(d.details);
  const payment = normPayment(d.payment);
  const seller = normPerson(d.lawyer, { id: d.lawyer_user_id, name: d.lawyer_name ?? det.lawyer_name });
  const room = asStr(d.secure_chat_room_id ?? det.secure_chat_room_id) || (ROOM_RE.exec(asStr(d.chat_url))?.[1] ?? "");
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id ?? det.work_id),
    orderWorkId: asStr(d.order_work_id),
    status: low(d.status),
    paymentStatus: low(d.payment_status) || (payment?.status ?? ""),
    serviceTitle: cleanTitle(asStr(d.service_title ?? det.service_title)),
    sellerType: low(det.seller_type) || seller.role,
    price: uzs(d, "price") || (payment?.amount ?? 0),
    currency: asStr(d.currency, "UZS") || "UZS",
    note: asStr(det.client_note).trim(),
    preferredChannel: low(det.preferred_channel),
    preferredTime: asStr(det.preferred_time).trim(),
    requestedAt: asStr(det.requested_at),
    client: normPerson(d.client, { id: d.client_user_id, name: det.client_name }),
    seller,
    payment,
    roomId: room,
    canCreateCall: d.can_create_call === true && !!room,
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
  };
}
