import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { PlanCheckout, PlanPreview } from "../model/resultTypes";
import { currencyOf } from "./dict";
import { normPayGate } from "./payGate";

export function normPreview(v: unknown): PlanPreview {
  const d = asDict(v);
  const q = asDict(d.price_quote);
  return {
    planSlug: asStr(asDict(d.plan).slug),
    months: asNum(d.months),
    amount: uzs(d, "amount") || uzs(q, "total_amount"),
    currency: currencyOf(d.currency, q.currency),
    baseAmount: uzs(q, "base_amount"),
    subtotal: uzs(q, "subtotal"),
    discountPercent: asNum(q.discount_percent),
    discountAmount: uzs(q, "discount_amount"),
  };
}

export function normCheckout(v: unknown): PlanCheckout {
  const d = asDict(v);
  const payment = asDict(d.payment);
  const gate = normPayGate(d, payment);
  return {
    id: asStr(d.id), workId: asStr(d.work_id), status: asStr(d.status, "pending") || "pending", paymentId: asStr(d.payment_id),
    planId: asStr(d.plan_id), planSlug: asStr(d.plan_slug), amount: uzs(d, "amount"), currency: currencyOf(d.currency),
    telegramSent: d.telegram_sent === true || payment.telegram_sent === true || gate?.telegramSent === true,
  };
}
