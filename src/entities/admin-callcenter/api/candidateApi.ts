import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { UrgentCandidate } from "../model/urgentTypes";
import { cleanName } from "./urgentPeople";

function normCandidate(v: unknown): UrgentCandidate {
  const d = asDict(v);
  const u = asDict(d.user);
  return {
    userId: asStr(d.lawyer_user_id ?? u.id),
    name: cleanName(asStr(d.name ?? u.name)) || asStr(u.phone),
    role: asStr(d.seller_type) || asStr(d.role ?? u.role),
    region: asStr(d.region),
    specializations: asArr(d.specializations).map((x) => asStr(x)).filter(Boolean),
    rating: asNum(d.rating),
    reviewsCount: asNum(d.reviews_count),
    successRate: asNum(d.success_rate),
    workload: asNum(d.workload),
    directionMatch: d.direction_match !== false,
    external: Boolean(d.is_external_seller),
    callcenter: Boolean(d.is_callcenter_member),
    score: asNum(d.score),
  };
}

type Opts = { external?: boolean; callcenter?: boolean };

// Best fits for one request, ranked by the backend and already filtered by its directions.
export async function listCandidates(id: string, o: Opts = {}): Promise<UrgentCandidate[]> {
  const qs = new URLSearchParams({ limit: "50" });
  if (o.external !== undefined) qs.set("include_external", String(o.external));
  if (o.callcenter !== undefined) qs.set("include_callcenter", String(o.callcenter));
  return listFrom(await http(`/call-center/urgent-advokat/requests/${encodeURIComponent(id)}/candidates?${qs}`), "items", "data").map(normCandidate);
}

// The same ranking without a request behind it: pick directions and a region by hand.
export async function searchCandidates(p: { directions: string[]; region: string } & Opts): Promise<UrgentCandidate[]> {
  const qs = new URLSearchParams({ limit: "50", include_external: "true", include_callcenter: "true" });
  if (p.directions.length) qs.set("directions", p.directions.join(","));
  if (p.region.trim()) qs.set("region", p.region.trim());
  return listFrom(await http(`/call-center/urgent-advokat/candidates?${qs}`), "items", "data").map(normCandidate);
}
