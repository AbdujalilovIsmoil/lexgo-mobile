import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { ActionPreview, ActionResult, PreviewRow } from "../model/actionTypes";
import { normCommands, pick, stepsOf } from "./normCommand";

function rowOf(v: unknown): PreviewRow | null {
  if (typeof v === "string") return v.trim() ? { label: "", value: v.trim().slice(0, 240) } : null;
  const d = asDict(v);
  const value = pick(d.value, d.text, d.amount_text, d.description);
  return value ? { label: pick(d.label, d.title, d.name, d.key).slice(0, 80), value: value.slice(0, 240) } : null;
}

export function normPreview(raw: unknown, action: string): ActionPreview {
  const d = asDict(raw);
  const p = asDict(d.preview);
  const amount = asNum(d.amount ?? p.amount, NaN);
  const who = asDict(d.on_behalf_of);
  return {
    action: pick(d.action, action),
    title: pick(d.title, p.title),
    summary: pick(d.summary, p.summary, d.message),
    amount: Number.isFinite(amount) && amount > 0 ? amount : null,
    currency: pick(d.currency, p.currency) || "UZS",
    amountText: pick(d.amount_text, p.amount_text),
    actor: pick(who.name, who.full_name),
    rows: asArr(d.details).map(rowOf).filter((r): r is PreviewRow => r !== null).slice(0, 8),
    warnings: stepsOf(d.warnings).slice(0, 4),
    confirmToken: pick(d.confirm_token, p.confirm_token),
    expiresAt: pick(d.expires_at),
    canExecute: d.can_execute !== false,
    requiresConfirmation: d.requires_confirmation !== false,
  };
}

export function normResult(raw: unknown): ActionResult {
  const d = asDict(raw);
  const r = asDict(d.result ?? d);
  const ticket = asDict(r.ticket ?? d.ticket);
  const next = asDict(r.next ?? d.next);
  const order = asDict(asDict(r.purchase_request ?? d.purchase_request).order);
  return {
    status: pick(d.status, r.status) || "confirmed",
    message: pick(d.message, r.message),
    paymentUrl: pick(r.payment_url, d.payment_url, r.checkout_url),
    nextHref: pick(next.href, next.route, r.href, d.href),
    ticketId: pick(ticket.id, r.ticket_id, d.ticket_id),
    workId: pick(ticket.work_id, order.work_id, r.work_id),
    resultRef: pick(ticket.id, order.id, r.order_id, r.request_id, r.record_id, r.payment_id, r.id),
    commands: normCommands(r.commands ?? d.commands, "next"),
  };
}
