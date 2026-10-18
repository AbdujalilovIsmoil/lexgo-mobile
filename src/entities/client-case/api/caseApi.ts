import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { CaseOrder, ClientCase } from "../model/types";

function normCase(v: unknown): ClientCase {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    caseNumber: asStr(d.case_number) || asStr(d.work_id),
    caseType: asStr(d.case_type),
    title: asStr(d.title),
    stage: asStr(d.stage).toLowerCase(),
    status: asStr(d.status).toLowerCase(),
    nextAction: asStr(d.next_action),
    orderId: asStr(d.order_id),
  };
}

function normOrder(v: unknown): CaseOrder {
  const d = asDict(v);
  const details = asDict(d.details);
  const service = asDict(d.service);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    title: asStr(d.title ?? details.title ?? service.name),
    serviceName: asStr(service.name ?? service.title ?? d.service_name ?? d.service_title ?? details.service_title ?? details.service_name),
    status: asStr(d.status).toLowerCase(),
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}

// GET /cases
export async function listCases(): Promise<ClientCase[]> {
  return listFrom(await http("/cases"), "cases", "items", "data").map(normCase);
}

// GET /orders
export async function listCaseOrders(): Promise<CaseOrder[]> {
  return listFrom(await http("/orders"), "orders", "items", "data").map(normOrder);
}
