import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { Candidate, Membership, Organization } from "../model/types";

export function normOrg(v: unknown): Organization {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: asStr(d.name).trim(),
    type: asStr(d.organization_type),
    phone: asStr(d.phone),
    inn: asStr(d.inn),
    region: asStr(d.region).trim(),
    address: asStr(d.address).trim(),
    verification: asStr(d.verification_status),
    ownerUserId: asStr(d.owner_user_id),
    createdAt: asStr(d.created_at),
  };
}

export function normMembership(v: unknown): Membership {
  const d = asDict(v);
  return { id: asStr(d.id), userId: asStr(d.user_id), title: asStr(d.title).trim(), status: asStr(d.status, "active"), createdAt: asStr(d.created_at) };
}

// GET /lawyers rows (the directory the web uses to pick a member).
export function normCandidate(v: unknown): Candidate {
  const d = asDict(v);
  return {
    userId: asStr(d.user_id),
    name: asStr(d.lawyer_name ?? d.name).trim(),
    kind: asStr(d.seller_type),
    region: asStr(d.region),
    verification: asStr(d.verification_status),
    rating: asNum(d.rating),
    reviews: asNum(d.reviews_count),
  };
}
