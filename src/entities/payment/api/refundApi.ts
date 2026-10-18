import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";

// POST /refund-requests — a record the call centre reviews; the payment stays as it is.
export async function createRefundRequest(i: { paymentId: string; reason: string; amount: number; title: string }): Promise<string> {
  const body = { record_type: "refund", title: i.title, price: Math.round(i.amount), currency: "UZS", payload: { payment_id: i.paymentId, reason: i.reason } };
  return asStr(asDict(await http("/refund-requests", { method: "POST", body })).work_id);
}
