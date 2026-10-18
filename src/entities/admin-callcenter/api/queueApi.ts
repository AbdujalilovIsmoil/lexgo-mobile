import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { QueueItem } from "../model/types";

const strs = (v: unknown) => asArr(v).map((x) => asStr(x)).filter(Boolean);

function normQueueItem(v: unknown): QueueItem {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    type: asStr(d.type),
    title: asStr(d.title),
    status: asStr(d.status),
    score: asStr(d.score),
    urgency: asStr(d.urgency),
    region: asStr(d.region),
    slaMinutes: asNum(d.sla_minutes, 60),
    ageMinutes: asNum(d.age_minutes),
    slaBreached: Boolean(d.sla_breached),
    sellerLoad: d.recommended_seller_load == null ? null : asNum(d.recommended_seller_load),
    serviceKind: asStr(d.service_kind),
    channel: asStr(d.channel),
    directions: strs(d.directions),
    lawyerCount: asNum(d.requested_lawyer_count),
    claimed: Boolean(asStr(d.claimed_by_user_id)),
    createdAt: asStr(d.created_at),
  };
}

// GET /call-center/queue (callcenter.access): leads, unassigned orders and urgent requests, SLA-breached first.
export async function getQueue(): Promise<QueueItem[]> {
  return listFrom(await http("/call-center/queue"), "items", "data", "queue").map(normQueueItem);
}

// POST /matching/orders/{id}/assign-next — hand an unassigned order to the next ranked seller (orders.manage).
export async function assignNextSeller(orderId: string): Promise<void> {
  await http(`/matching/orders/${orderId}/assign-next`, { method: "POST" });
}

// PATCH /call-center/leads/{id}/move — a lead to another board column.
export async function moveCcLead(leadId: string, columnKey: string): Promise<void> {
  await http(`/call-center/leads/${leadId}/move`, { method: "PATCH", body: { column_key: columnKey, position: 0 } });
}
