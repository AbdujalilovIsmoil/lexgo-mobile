import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { SellerFeed, SellerFilter, SellerRequest } from "../model/types";

export function normSellerRequest(v: unknown): SellerRequest {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    verificationId: asStr(d.verification_id),
    status: asStr(d.status),
    role: asStr(d.role),
    name: asStr(d.name) || [asStr(d.last_name), asStr(d.first_name), asStr(d.middle_name)].filter(Boolean).join(" "),
    phone: asStr(d.phone),
    region: asStr(d.region),
    workId: asStr(asDict(d.payload).work_id),
    createdAt: asStr(d.created_at),
  };
}

// GET /admin/seller-requests — the unified seller registration queue plus role/status counters.
export async function listSellerRequests(f: SellerFilter): Promise<SellerFeed> {
  const qs = new URLSearchParams();
  if (f.status) qs.set("status", f.status);
  if (f.role) qs.set("role", f.role);
  if (f.from) qs.set("date_from", f.from);
  if (f.to) qs.set("date_to", f.to);
  const raw = asDict(await http(`/admin/seller-requests${qs.size ? `?${qs}` : ""}`));
  const s = asDict(raw.stats);
  return {
    items: listFrom(raw, "items", "requests", "data").map(normSellerRequest),
    stats: { total: asNum(s.total), advokat: asNum(s.advokat), yurist: asNum(s.yurist), advokatTashkiloti: asNum(s.advokat_tashkiloti), pending: asNum(s.pending), approved: asNum(s.approved), rejected: asNum(s.rejected) },
  };
}

// POST /admin/register-requests/{id}/accept — creates the seller account and verifies the profile.
export async function acceptRequest(id: string): Promise<void> {
  await http(`/admin/register-requests/${encodeURIComponent(id)}/accept`, { method: "POST" });
}

// POST /admin/register-requests/{id}/reject
export async function rejectRequest(id: string): Promise<void> {
  await http(`/admin/register-requests/${encodeURIComponent(id)}/reject`, { method: "POST" });
}
