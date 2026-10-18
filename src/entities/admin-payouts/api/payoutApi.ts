import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { Payout, Reconciliation } from "../model/types";

function normPayout(v: unknown): Payout {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    paymentId: asStr(d.payment_id),
    sellerUserId: asStr(d.seller_user_id),
    gross: uzs(d, "gross_amount", "gross"),
    platformFee: uzs(d, "platform_fee"),
    providerFee: uzs(d, "provider_fee"),
    sellerShare: uzs(d, "seller_share"),
    status: asStr(d.status, "queued"),
    currency: asStr(d.currency, "UZS"),
    note: asStr(d.note),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
  };
}

// GET /admin/payouts[?status=] — the whole list (the endpoint has no paging).
export async function listPayouts(status = ""): Promise<Payout[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return listFrom(await http(`/admin/payouts${q}`), "items", "data", "payouts").map(normPayout);
}

// PATCH /admin/payouts/{id} — the backend accepts any payout status; the app only sends "paid".
export async function updatePayout(id: string, status: string, note = ""): Promise<void> {
  await http(`/admin/payouts/${id}`, { method: "PATCH", body: { status, note } });
}

// GET /payments/reconciliation — platform money flow in one object.
export async function getReconciliation(): Promise<Reconciliation> {
  const d = asDict(await http("/payments/reconciliation"));
  return {
    paymentsCount: asNum(d.payments_count),
    paidCount: asNum(d.paid_count),
    gross: uzs(d, "gross_amount"),
    platformFee: uzs(d, "platform_fee"),
    providerFee: uzs(d, "provider_fee"),
    sellerShare: uzs(d, "seller_share"),
    statuses: asDict(d.payout_statuses) as Record<string, number>,
    providers: asArr(d.by_provider).map((x) => {
      const r = asDict(x);
      return { provider: asStr(r.provider), count: asNum(r.count), amount: uzs(r, "amount") };
    }),
  };
}
