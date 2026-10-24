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
    acceptanceDeadlineAt: asStr(d.acceptance_deadline_at ?? details.acceptance_deadline_at ?? d.confirmation_deadline_at ?? details.confirmation_deadline_at) || undefined,
  };
}

export async function listOrders(): Promise<Order[]> {
  return listFrom(await http("/orders"), "orders", "items", "data")
    .map(normOrder)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export type NewOrder = { serviceId: string; lawyerUserId?: string; packageId?: string; region?: string; problem?: string; optionIds?: string[]; title?: string };

// POST /orders (TZ.md §3): a marketplace order for the chosen specialist — or, without `lawyerUserId`, for the one the platform assigns.
// The backend prices it and runs the flow (assignment → advance → work); the client is shown the status it answers with.
export async function createOrder(input: NewOrder): Promise<Order> {
  const details = {
    region: input.region ?? "",
    problem: input.problem?.trim() ?? "",
    selected_option_ids: input.optionIds ?? [],
    ...(input.title ? { service_title: input.title } : {}),
  };
  const body = { service_id: input.serviceId, package_id: input.packageId || null, ...(input.lawyerUserId ? { lawyer_user_id: input.lawyerUserId } : {}), source: "marketplace", details };
  return normOrder(await http("/orders", { method: "POST", body }));
}
