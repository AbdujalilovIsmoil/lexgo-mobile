import { http } from "@/shared/api";
import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { Page } from "@/shared/lib/usePaged";
import type { Dashboard, WorkItem } from "../model/workTypes";
import { normOrg } from "./normOrg";
import { normMember, normWork } from "./normWork";

const enc = encodeURIComponent;

// GET /organizations/{id}/owner/dashboard — members with workload plus the active orders / cases / urgent requests.
export async function getDashboard(orgId: string): Promise<Dashboard> {
  const d = asDict(await http(`/organizations/${enc(orgId)}/owner/dashboard`));
  const s = asDict(d.summary);
  return {
    org: normOrg(d.organization),
    summary: { members: asNum(s.members_count), verified: asNum(s.verified_members_count), orders: asNum(s.active_orders), cases: asNum(s.active_cases), urgent: asNum(s.urgent_requests) },
    members: asArr(d.members).map(normMember),
    orders: asArr(d.active_orders).map((x) => normWork(x, "order")),
    cases: asArr(d.active_cases).map((x) => normWork(x, "case")),
    urgent: asArr(d.urgent_requests).map((x) => normWork(x, "urgent")),
  };
}

export type WorkloadQuery = { memberId?: string; status?: string; limit: number; offset: number };

// GET /organizations/{id}/owner/workload — the members' orders (limit <= 100; an unknown member is a 404).
export async function listWorkload(orgId: string, q: WorkloadQuery): Promise<Page<WorkItem>> {
  const qs = new URLSearchParams({ limit: String(Math.min(100, q.limit)), offset: String(q.offset) });
  if (q.memberId) qs.set("member_user_id", q.memberId);
  if (q.status) qs.set("status", q.status);
  const d = asDict(await http(`/organizations/${enc(orgId)}/owner/workload?${qs}`));
  const items = asArr(d.items).map((x) => normWork(x, "order"));
  const total = asNum(d.total, q.offset + items.length);
  return { items, total, hasMore: typeof d.has_more === "boolean" ? d.has_more : q.offset + items.length < total };
}
