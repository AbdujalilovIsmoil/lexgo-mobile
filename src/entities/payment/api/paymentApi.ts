import { http } from "@/shared/api";
import { asDict, asStr, listFrom, uzs } from "@/shared/lib/json";
import { safePaymentUrl } from "../lib/providers";
import type { PaymentIntent, PaymentRow } from "../model/types";

export function normPayment(v: unknown): PaymentRow {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    amount: uzs(d, "amount"),
    currency: asStr(d.currency, "UZS"),
    status: asStr(d.status),
    method: asStr(d.method ?? d.provider),
    kind: asStr(d.kind ?? d.target_type),
    description: asStr(d.description),
    orderId: asStr(d.order_id),
    createdAt: asStr(d.created_at),
    hasReceipt: Boolean(d.receipt_url),
  };
}

// PaymentOut, bare or nested under `payment` (purchase and gift answers).
export function normIntent(v: unknown): PaymentIntent {
  const raw = asDict(v);
  const d = raw.payment && typeof raw.payment === "object" ? asDict(raw.payment) : raw;
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    status: asStr(d.status),
    amount: uzs(d, "amount"),
    currency: asStr(d.currency, "UZS"),
    provider: asStr(d.provider),
    paymentUrl: safePaymentUrl(d.payment_url ?? asDict(d.invoice).payment_url),
  };
}

// GET /payments — newest first. The backend returns the whole history.
export async function listPayments(): Promise<PaymentRow[]> {
  const rows = listFrom(await http("/payments"), "items", "data").map(normPayment).filter((p) => p.id);
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

// Authed PDF; open it with <FilePreview file={{ path }} />.
export const receiptPath = (id: string): string => `/payments/${encodeURIComponent(id)}/receipt`;
