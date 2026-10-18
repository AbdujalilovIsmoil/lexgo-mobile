import { http } from "@/shared/api";
import { PAYMENT_PROVIDER } from "@/shared/config/env";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { PaymentIntent, PaymentPolicy, PriceQuote } from "../model/types";

export async function getPaymentPolicy(orderId: string): Promise<PaymentPolicy> {
  const d = asDict(await http(`/orders/${orderId}/payment-policy`));
  const advance = uzs(d, "advance_amount", "upfront_amount");
  const paid = uzs(d, "paid_amount", "paid");
  return {
    orderId,
    price: uzs(d, "price", "total_amount", "total"),
    advancePercent: asNum(d.advance_percent ?? d.upfront_percent, 10),
    advanceAmount: advance,
    paidAmount: paid,
    remainingToUnlock: uzs(d, "remaining_to_unlock", "remaining") || Math.max(0, advance - paid),
    contactUnlocked: Boolean(d.contact_unlocked),
    currency: asStr(d.currency, "UZS"),
  };
}

// GET /pricing/quote — final price for this service + specialist. The backend applies region,
// experience, super-advocate and referral modifiers only when `seller_user_id` is sent.
export async function getPriceQuote(serviceId: string, sellerUserId: string, region = "", packageId = ""): Promise<PriceQuote> {
  const qs = new URLSearchParams({ service_id: serviceId, seller_user_id: sellerUserId });
  if (packageId) qs.set("package_id", packageId);
  if (region) qs.set("region", region);
  const d = asDict(await http(`/pricing/quote?${qs}`));
  const ref = asDict(d.referral_discount);
  return {
    baseAmount: uzs(d, "base_amount", "subtotal", "base"),
    subtotal: uzs(d, "subtotal") || undefined,
    discountAmount: uzs(d, "discount_amount"),
    totalAmount: uzs(d, "total_amount", "total", "price"),
    currency: asStr(d.currency, "UZS"),
    referralPercent: asNum(d.discount_percent) || asNum(ref.discount_percent) || undefined,
    modifiers: asArr(d.modifiers).map((x) => {
      const m = asDict(x);
      return { key: asStr(m.code ?? m.key ?? m.type), label: asStr(m.label ?? m.name), percent: asNum(m.percent) || undefined, amount: uzs(m, "amount") || undefined, multiplier: asNum(m.multiplier) || undefined };
    }),
  };
}

// POST /payments — an invoice for the order's advance; the provider page is opened when a URL comes back.
export async function createOrderPayment(orderId: string, amount: number, provider = PAYMENT_PROVIDER): Promise<PaymentIntent> {
  const body = { provider, currency: "UZS", amount: Math.round(amount), order_id: orderId, target_type: "order", target_id: orderId, provider_payload: { purpose: "order_advance" } };
  const d = asDict(await http("/payments", { method: "POST", body }));
  const url = asStr(d.payment_url ?? asDict(d.invoice).payment_url);
  return { id: asStr(d.id ?? asDict(d.payment).id), status: asStr(d.status), paymentUrl: /^https:\/\/\S+$/i.test(url) ? url : undefined };
}
