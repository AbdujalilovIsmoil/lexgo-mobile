import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { Milestone, StatusEntry } from "../model/types";

const norm = (v: unknown): Milestone => {
  const d = asDict(v);
  return { id: asStr(d.id), index: asNum(d.index), title: asStr(d.title), percent: asNum(d.percent), amount: uzs(d, "amount"), status: asStr(d.status, "pending") };
};

// GET /orders/{id}/status-history — newest first.
export async function orderHistory(orderId: string): Promise<StatusEntry[]> {
  return listFrom(await http(`/orders/${orderId}/status-history`), "items", "data", "history")
    .map((x) => { const d = asDict(x); return { status: asStr(d.status ?? d.stage).toLowerCase(), note: asStr(d.note), at: asStr(d.created_at ?? d.at) }; })
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

// PATCH /orders/{id}/status
export async function moveOrder(orderId: string, status: string, note?: string): Promise<void> {
  await http(`/orders/${orderId}/status`, { method: "PATCH", body: { status, note } });
}

// GET /orders/{id}/milestones
export async function listMilestones(orderId: string): Promise<Milestone[]> {
  return listFrom(await http(`/orders/${orderId}/milestones`), "items", "data", "milestones").map(norm).sort((a, b) => a.index - b.index);
}

// POST /orders/{id}/milestones/{mid}/pay — checkout link of the payment provider.
export async function payMilestone(orderId: string, id: string, provider: string): Promise<{ paymentId: string; url: string }> {
  const d = asDict(await http(`/orders/${orderId}/milestones/${id}/pay?provider=${encodeURIComponent(provider)}`, { method: "POST" }));
  const pay = asDict(d.payment);
  const url = asStr(pay.payment_url);
  // Staging: the demo provider settles instantly.
  if (provider.startsWith("demo") && asStr(pay.id)) await http(`/payments/${asStr(pay.id)}/demo-confirm`, { method: "POST" }).catch(() => null);
  return { paymentId: asStr(pay.id), url: /^https:\/\//i.test(url) ? url : "" };
}

// POST /orders/{id}/milestones/{mid}/release
export async function releaseMilestone(orderId: string, id: string): Promise<void> {
  await http(`/orders/${orderId}/milestones/${id}/release`, { method: "POST" });
}
