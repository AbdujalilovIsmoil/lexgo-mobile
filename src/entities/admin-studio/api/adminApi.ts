import { http } from "@/shared/api";
import { normDetail } from "../lib/normObject";
import { normMonitoring } from "../lib/normMonitor";
import { normGrant, normRoute } from "../lib/normSettings";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { listOf } from "../lib/norm";
import { enc, qs } from "../lib/qs";
import type { StudioDetail } from "../model/types";
import type { StudioGrant, StudioGrantInput, StudioMonitoring, StudioRoute, StudioRouteInput } from "../model/typesAdmin";

// GET /admin/studio/approvals — submitted work (with steps), oldest first is up to the caller.
export async function listApprovals(q: { code?: string; status?: string } = {}): Promise<StudioDetail[]> {
  const res = await http(`/admin/studio/approvals${qs({ constructor_code: q.code, status: q.status })}`);
  return listOf(res, ["items", "approvals"]).map(normDetail).filter((o) => o.id);
}

type MonitorQuery = { code?: string; userId?: string; from?: string; to?: string };
export async function getMonitoring(q: MonitorQuery = {}): Promise<StudioMonitoring> {
  return normMonitoring(await http(`/admin/studio/monitoring${qs({ constructor_code: q.code, user_id: q.userId, date_from: q.from, date_to: q.to })}`));
}

export async function listGrants(): Promise<StudioGrant[]> {
  return listOf(await http("/admin/studio/access"), ["items", "grants"]).map(normGrant);
}

// POST /admin/studio/access — creates or updates a user's studio roles (empty codes = all constructors).
export async function saveGrant(i: StudioGrantInput): Promise<void> {
  const body = { ...(i.id ? { id: i.id } : {}), user_id: i.userId, roles: i.roles, role: i.roles[0] ?? "", constructor_codes: i.codes, is_active: i.active, status: i.active ? "active" : "inactive" };
  await http("/admin/studio/access", { method: "POST", body });
}

export async function listRoutes(): Promise<StudioRoute[]> {
  return listOf(await http("/admin/studio/approval-routes"), ["items", "routes"]).map(normRoute);
}

// POST /admin/studio/approval-routes — saving a route for a constructor replaces its current one.
export async function saveRoute(i: StudioRouteInput): Promise<void> {
  await http("/admin/studio/approval-routes", { method: "POST", body: { constructor_code: i.code, title: i.title, steps: i.steps, status: i.status } });
}

export type ApprovalUser = { id: string; name: string; code: string; roles: string[] };

// GET /admin/studio/approval-users — people who may be put on an approval step (`code` narrows to a constructor's reviewers).
export async function listApprovalUsers(q = "", code = ""): Promise<ApprovalUser[]> {
  const res = await http(`/admin/studio/approval-users${qs({ limit: 100, q: q.trim(), constructor_code: code })}`);
  return listOf(res, ["items", "users", "data"]).map((x) => {
    const d = asDict(x);
    const roles = asArr(d.constructor_roles).length ? asArr(d.constructor_roles) : asArr(d.studio_roles);
    return { id: asStr(d.id) || asStr(d.value), name: asStr(d.label) || asStr(d.name), code: asStr(d.employee_code), roles: roles.map((r) => asStr(r)).filter(Boolean) };
  }).filter((u) => u.id);
}

// POST /admin/studio/approval-steps/{id}/reassign — hand one approver's share of a step to someone else.
export async function reassignStep(stepId: string, i: { from: string; to: string; message: string }): Promise<void> {
  await http(`/admin/studio/approval-steps/${enc(stepId)}/reassign`, { method: "POST", body: { from_user_id: i.from, to_user_id: i.to, message: i.message } });
}

// POST /admin/studio/approvals/process-overdue — escalate the steps past their deadline.
export async function processOverdue(): Promise<void> {
  await http("/admin/studio/approvals/process-overdue", { method: "POST" });
}

export type BulkResult = { published: string[]; failed: { id: string; message: string }[] };
const idOf = (x: unknown): string => (typeof x === "string" || typeof x === "number" ? String(x) : asStr(asDict(x).object_id) || asStr(asDict(x).id) || asStr(asDict(asDict(x).object).id));

// POST /admin/studio/approvals/bulk-publish — publish several approved objects at once; each one succeeds or fails on its own.
export async function bulkPublish(ids: string[], note: string): Promise<BulkResult> {
  const d = asDict(await http("/admin/studio/approvals/bulk-publish", { method: "POST", body: { object_ids: ids, note } }));
  const ok = asArr(d.published ?? d.succeeded ?? d.ok);
  const bad = asArr(d.failed ?? d.errors);
  return {
    published: ok.map(idOf).filter(Boolean),
    failed: bad.map((x) => {
      const e = asDict(x);
      const det = asDict(e.error ?? e.detail);
      return { id: idOf(x), message: asStr(e.message) || asStr(det.message) || (typeof e.error === "string" ? e.error : "") || (typeof e.detail === "string" ? e.detail : "") || asStr(e.code) };
    }).filter((f) => f.id),
  };
}
