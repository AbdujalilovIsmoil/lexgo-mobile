import { http } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import type { ManagedList, ManagedService, ServiceInput, ServiceStatus } from "../model/serviceTypes";
import { normManaged, normManagedList } from "./normService";

const enc = encodeURIComponent;
const base = (org: string, member: string) => `/organizations/${enc(org)}/members/${enc(member)}/services`;
const body = (i: ServiceInput) => ({ selected_price: Math.max(0, Math.round(i.price || 0)), experience_note: i.note.trim().slice(0, 2000), status: i.status });

// GET …/services/manage — the member's services with price limits; 404 when the member is not a seller.
export async function listMemberServices(org: string, member: string, locale: string): Promise<ManagedList> {
  return normManagedList(await http(`${base(org, member)}/manage?include_inactive=true`), locale);
}

export async function addMemberService(org: string, member: string, i: ServiceInput, locale: string): Promise<ManagedService> {
  return normManaged(await http(`${base(org, member)}/manage`, { method: "POST", body: { service_id: i.serviceId, ...body(i) } }), locale);
}

export async function updateMemberService(org: string, member: string, i: ServiceInput, locale: string): Promise<ManagedService> {
  return normManaged(await http(`${base(org, member)}/${enc(i.serviceId)}`, { method: "PATCH", body: body(i) }), locale);
}

export async function setMemberServiceStatus(org: string, member: string, serviceId: string, status: ServiceStatus, locale: string): Promise<ManagedService> {
  return normManaged(await http(`${base(org, member)}/${enc(serviceId)}/status`, { method: "PATCH", body: { status } }), locale);
}

export async function removeMemberService(org: string, member: string, serviceId: string): Promise<void> {
  await http(`${base(org, member)}/${enc(serviceId)}`, { method: "DELETE" });
}

// GET /pricing/quote — total for the fallback price range (70-100 %) while an item has no pricing_limits yet.
export async function quoteTotal(serviceId: string, sellerId: string, region: string): Promise<number> {
  const qs = new URLSearchParams({ service_id: serviceId, seller_user_id: sellerId, apply_referral: "false", region });
  return Number(asDict(await http(`/pricing/quote?${qs}`)).total_amount) || 0;
}
