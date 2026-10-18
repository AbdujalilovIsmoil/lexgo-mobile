import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import type { Candidate, Membership, OrgInput, Organization } from "../model/types";
import { normCandidate, normMembership, normOrg } from "./normOrg";

const enc = encodeURIComponent;

// GET /organizations — every organization the caller may see (staff see all; the UI keeps the owner's own).
export async function listOrganizations(): Promise<Organization[]> {
  return listFrom(await http("/organizations"), "organizations", "items", "data").map(normOrg).filter((o) => o.id);
}

// POST /organizations — the caller becomes the owner.
export async function createOrganization(i: OrgInput): Promise<Organization> {
  const body = { organization_type: "advokat_tashkiloti", name: i.name.trim(), phone: i.phone.trim(), inn: i.inn.trim(), region: i.region.trim(), address: i.address.trim() };
  return normOrg(await http("/organizations", { method: "POST", body }));
}

export async function listMemberships(orgId: string): Promise<Membership[]> {
  return listFrom(await http(`/organizations/${enc(orgId)}/members`), "members", "items", "data").map(normMembership);
}

// POST /organizations/{id}/members — adds the user, or (same user_id) updates the title.
export async function addMember(orgId: string, userId: string, title: string): Promise<Membership> {
  return normMembership(await http(`/organizations/${enc(orgId)}/members`, { method: "POST", body: { user_id: userId, title: title.trim() } }));
}

// GET /lawyers — sellers that can be invited (no phone search exists for owners).
export async function listCandidates(): Promise<Candidate[]> {
  return listFrom(await http("/lawyers"), "lawyers", "items", "data").map(normCandidate).filter((c) => c.userId && c.name);
}
