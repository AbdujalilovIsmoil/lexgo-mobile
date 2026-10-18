import { http } from "@/shared/api";
import { normDetail } from "../lib/normObject";
import { normMonitoring } from "../lib/normMonitor";
import { normGrant, normRoute } from "../lib/normSettings";
import { listOf } from "../lib/norm";
import { qs } from "../lib/qs";
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
