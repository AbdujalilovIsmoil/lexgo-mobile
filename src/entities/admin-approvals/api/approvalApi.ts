import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { Approval, Step } from "../model/types";

export function normApproval(v: unknown): Approval {
  const d = asDict(v);
  const payload = asDict(d.payload);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    type: asStr(d.request_type ?? d.type ?? d.kind),
    status: asStr(d.status),
    adminApproved: !!(d.admin_approved_by_user_id ?? d.admin_approved),
    managerApproved: !!(d.manager_approved_by_user_id ?? d.manager_approved),
    reason: asStr(d.reason),
    summary: [asStr(payload.name), asStr(payload.phone)].filter(Boolean).join(" · "),
    payload,
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}

// GET /approvals — every two-step (admin + manager) approval request, newest first.
export async function listApprovals(): Promise<Approval[]> {
  return listFrom(await http("/approvals"), "approvals", "items", "data").map(normApproval);
}

// POST /approvals/{id}/admin-approve | manager-approve
export async function approveStep(id: string, step: Step): Promise<Approval> {
  return normApproval(await http(`/approvals/${encodeURIComponent(id)}/${step}-approve`, { method: "POST" }));
}
