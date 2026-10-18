import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { CaseInput, ProCase } from "../model/types";

export function normCase(v: unknown): ProCase {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    number: asStr(d.case_number ?? d.work_id),
    clientUserId: asStr(d.client_user_id),
    lawyerUserId: asStr(d.lawyer_user_id),
    orderId: asStr(d.order_id),
    type: asStr(d.case_type),
    stage: asStr(d.stage),
    status: asStr(d.status).toLowerCase(),
    title: asStr(d.title ?? d.case_type),
    description: asStr(d.description),
    nextAction: asStr(d.next_action),
    deadlineAt: asStr(d.deadline_at),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
  };
}

const byRecent = (a: ProCase, b: ProCase) => b.updatedAt.localeCompare(a.updatedAt);

// GET /lawyers/me/cases — the professional's own cases (plain array).
export async function listCases(): Promise<ProCase[]> {
  return listFrom(await http("/lawyers/me/cases"), "cases", "items", "data").map(normCase).sort(byRecent);
}
export const getCase = async (id: string): Promise<ProCase> => normCase(await http(`/cases/${encodeURIComponent(id)}`));
export const createCase = async (body: CaseInput & { title: string }): Promise<ProCase> => normCase(await http("/cases", { method: "POST", body }));
export const updateCase = async (id: string, body: CaseInput): Promise<ProCase> => normCase(await http(`/cases/${encodeURIComponent(id)}`, { method: "PATCH", body }));
export const setCaseStatus = async (id: string, status: string, nextAction?: string): Promise<ProCase> =>
  normCase(await http(`/cases/${encodeURIComponent(id)}/status`, { method: "POST", body: { status, ...(nextAction !== undefined ? { next_action: nextAction } : {}) } }));
export const archiveCase = async (id: string): Promise<ProCase> => normCase(await http(`/cases/${encodeURIComponent(id)}/archive`, { method: "POST" }));
