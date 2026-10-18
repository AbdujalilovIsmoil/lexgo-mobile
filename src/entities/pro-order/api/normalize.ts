import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { normAdditional, normPackSnap, normQuoteSnap, normRating, normResult } from "./normExtra";
import type { Milestone, OrderStep, ProOrder } from "../model/types";

const ROOM_RE = /\/secure-chats\/([^/?#]+)/;

export function normOrder(v: unknown): ProOrder {
  const d = asDict(v);
  const details = asDict(d.details);
  const client = asDict(d.client);
  const payment = asDict(d.payment);
  const roomId = asStr(d.secure_chat_room_id ?? details.secure_chat_room_id) || (ROOM_RE.exec(asStr(d.chat_url))?.[1] ?? "");
  const { optionIds, ...quote } = normQuoteSnap(d);
  return {
    id: asStr(d.id ?? d.order_id),
    workId: asStr(d.work_id),
    status: asStr(d.status).toLowerCase(),
    paymentStatus: asStr(d.payment_status ?? payment.status).toLowerCase(),
    serviceId: asStr(d.service_id),
    serviceTitle: asStr(d.service_title ?? details.service_title).trim(),
    price: uzs(d, "price") || uzs(payment, "amount"),
    currency: asStr(d.currency, "UZS") || "UZS",
    note: asStr(details.client_note ?? d.note).trim(),
    preferredChannel: asStr(details.preferred_channel).toLowerCase(),
    preferredTime: asStr(details.preferred_time).trim(),
    buyerName: asStr(client.name ?? details.client_name).trim(),
    buyerPublicId: asStr(client.lexgo_id),
    buyerUserId: asStr(d.client_user_id ?? client.id),
    roomId,
    canChat: d.can_start_chat === true && !!roomId,
    canComplete: !!asStr(d.complete_url),
    canCall: d.can_create_call === true && !!roomId,
    packageId: asStr(d.package_id ?? details.package_id),
    optionIds,
    quote,
    pack: normPackSnap(d),
    result: normResult(d),
    rating: normRating(d),
    additional: normAdditional(d),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
  };
}

// MarketplaceRecordOut: the new status is in payload.status (record `status` is just "active").
export function normStep(v: unknown): OrderStep {
  const d = asDict(v);
  const p = asDict(d.payload);
  return { status: asStr(p.status ?? d.record_type ?? d.status).toLowerCase(), note: asStr(p.note).trim(), at: asStr(d.created_at) };
}

export function normMilestone(v: unknown): Milestone {
  const d = asDict(v);
  return { id: asStr(d.id), index: asNum(d.index), title: asStr(d.title), percent: asNum(d.percent), amount: uzs(d, "amount"), currency: asStr(d.currency, "UZS"), status: asStr(d.status).toLowerCase() };
}

export const listOf = (v: unknown, ...keys: string[]): unknown[] => (Array.isArray(v) ? v : keys.flatMap((k) => asArr(asDict(v)[k])));
