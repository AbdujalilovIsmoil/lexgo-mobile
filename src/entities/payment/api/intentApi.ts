import { http } from "@/shared/api";
import { asDict, asStr, uzs } from "@/shared/lib/json";
import { normIntent } from "./paymentApi";
import type { PaymentIntent, PaymentSplit, ReceiptCheck } from "../model/types";

export type CreatePaymentInput = {
  provider: string;
  amount: number; // whole UZS, taken from the backend quote or plan — never typed by the user
  targetType: string;
  targetId?: string;
  orderId?: string;
  purpose?: string;
};

// POST /payments creates a PENDING payment; the client never marks it paid (TZ 27/45).
export async function createPayment(i: CreatePaymentInput): Promise<PaymentIntent> {
  const body = {
    provider: i.provider,
    currency: "UZS",
    amount: Math.round(i.amount),
    target_type: i.targetType,
    ...(i.targetId ? { target_id: i.targetId } : {}),
    ...(i.orderId ? { order_id: i.orderId } : {}),
    provider_payload: i.purpose ? { purpose: i.purpose } : {},
  };
  return normIntent(await http("/payments", { method: "POST", body }));
}

export async function verifyReceipt(id: string): Promise<ReceiptCheck> {
  const d = asDict(await http(`/payments/${encodeURIComponent(id)}/receipt/verify`));
  return { valid: d.valid === true, status: asStr(d.status), amount: uzs(d, "amount"), paidAmount: uzs(d, "paid_amount"), currency: asStr(d.currency, "UZS"), provider: asStr(d.provider) };
}

export async function getPaymentSplit(id: string): Promise<PaymentSplit> {
  const d = asDict(await http(`/payments/${encodeURIComponent(id)}/split`));
  return { gross: uzs(d, "gross_amount"), platformFee: uzs(d, "platform_fee"), sellerShare: uzs(d, "seller_share"), providerFee: uzs(d, "provider_fee"), currency: asStr(d.currency, "UZS") };
}
