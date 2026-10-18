import { http } from "@/shared/api";
import { asDict, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { Order } from "../model/types";

export function normOrder(v: unknown): Order {
  const d = asDict(v);
  const details = asDict(d.details);
  const service = asDict(d.service);
  const amount = uzs(d, "price", "amount");
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    title: asStr(details.question) || asStr(d.title ?? details.title ?? service.name),
    serviceName: asStr(service.name ?? service.title ?? d.service_name ?? d.service_title ?? details.service_title),
    status: asStr(d.status).toLowerCase(),
    paymentStatus: asStr(d.payment_status).toLowerCase(),
    region: asStr(d.region ?? details.region),
    amount: amount > 0 ? amount : undefined,
    createdAt: asStr(d.created_at ?? d.createdAt),
    lawyerName: asStr(d.lawyer_name ?? asDict(d.lawyer).name) || undefined,
    source: asStr(d.source) || undefined,
  };
}

export async function listOrders(): Promise<Order[]> {
  return listFrom(await http("/orders"), "orders", "items", "data")
    .map(normOrder)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

// POST /orders — the client picks a service and a specialist; the backend prices it.
export async function createOrder(input: { serviceId: string; lawyerUserId: string; note?: string; title?: string; packageId?: string }): Promise<Order> {
  const details = { ...(input.note ? { question: input.note } : {}), ...(input.title ? { service_title: input.title } : {}) };
  const body = { source: "mobile", service_id: input.serviceId, lawyer_user_id: input.lawyerUserId, ...(input.packageId ? { package_id: input.packageId } : {}), details };
  return normOrder(await http("/orders", { method: "POST", body }));
}
