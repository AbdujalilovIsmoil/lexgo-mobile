import { ApiError, http } from "@/shared/api";
import { asDict, asStr, uzs } from "@/shared/lib/json";
import { safeHttpsUrl } from "@/shared/lib/pay/safeUrl";
import type { ActivePurchase, ContactSpeed, MarketPurchase, PaymentProvider, PreferredChannel, Urgency } from "../model/marketTypes";

export type PurchaseInput = { note: string; channel: PreferredChannel; time: string; optionIds?: string[]; contactSpeed?: ContactSpeed; urgency?: Urgency; provider?: PaymentProvider };
const enc = encodeURIComponent;

// The request as the web portal sends it (Enterprise contract §3): the contact speed and the urgency also go into `details` for the
// seller's card. No amount and no currency: the backend prices the order. No provider unless one was chosen — the backend's default is the
// Telegram approval.
export function purchaseBody(i: PurchaseInput): Record<string, unknown> {
  const note = i.note.trim();
  const time = i.time.trim();
  return {
    selected_option_ids: i.optionIds ?? [],
    note,
    preferred_channel: i.channel,
    ...(time ? { preferred_time: time } : {}),
    ...(i.contactSpeed ? { contact_speed: i.contactSpeed } : {}),
    ...(i.urgency ? { urgency: i.urgency } : {}),
    ...(i.contactSpeed || i.urgency ? { details: { note, contact_channel: i.channel, ...(i.contactSpeed ? { contact_speed: i.contactSpeed } : {}), ...(i.urgency ? { urgency: i.urgency } : {}) } } : {}),
    ...(i.provider ? { payment_provider: i.provider } : {}),
  };
}
const body = purchaseBody;

// POST /marketplace/lawyers/{id}/services/{sid}/purchase-request. No amount is
// sent: the backend prices the service and waits for the Telegram approval.
export async function requestPurchase(lawyerId: string, serviceId: string, input: PurchaseInput): Promise<MarketPurchase> {
  const d = await http(`/marketplace/lawyers/${enc(lawyerId)}/services/${enc(serviceId)}/purchase-request`, { method: "POST", body: body(input) });
  return normPurchase(asDict(d));
}

// POST the seller's own `package_purchase_url` (/marketplace/service-packages/{id}/lawyers/{lawyer}/purchase-request):
// one seller fulfils one package order. The path is never rebuilt on the phone.
export async function requestPackagePurchase(purchaseUrl: string, input: PurchaseInput): Promise<MarketPurchase> {
  const d = await http(purchaseUrl, { method: "POST", body: body(input) });
  return normPurchase(asDict(d));
}

export function normPurchase(d: ReturnType<typeof asDict>): MarketPurchase {
  const order = asDict(d.order);
  const payment = asDict(d.payment);
  const gate = asDict(d.payment_gate);
  return {
    orderId: asStr(order.id ?? d.order_id),
    workId: asStr(d.work_id) || asStr(asDict(d.purchase_request).work_id) || asStr(asDict(order.details).work_id) || asStr(order.work_id),
    status: asStr(order.status ?? d.status),
    amount: uzs(payment, "amount") || uzs(order, "price"),
    currency: asStr(payment.currency ?? order.currency, "UZS") || "UZS",
    telegramSent: d.telegram_sent === true || payment.telegram_sent === true || gate.telegram_sent === true,
    paymentStatus: asStr(payment.status).toLowerCase(),
    paymentUrl: safeHttpsUrl(payment.payment_url),
  };
}

// The 409 the backend answers when a pending/active order for this seller+service exists.
export function activePurchaseOf(e: unknown): ActivePurchase | null {
  if (!(e instanceof ApiError) || e.status !== 409) return null;
  const detail = asDict(e.data.detail);
  const code = e.code || asStr(detail.code);
  if (code !== "marketplace_order_already_active" && code !== "marketplace_package_order_already_active") return null;
  return { orderId: asStr(detail.order_id), workId: asStr(detail.work_id), status: asStr(detail.status) };
}

