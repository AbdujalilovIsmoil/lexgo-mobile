import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import { normLawyer } from "./normalize";
import type { Lawyer } from "../model/types";

// GET /lawyers?service_id= — the sellers who perform one catalogue service (the order picker).
export async function listServiceSellers(serviceId: string): Promise<Lawyer[]> {
  const data = await http(`/lawyers?${new URLSearchParams({ service_id: serviceId })}`);
  return listFrom(data, "lawyers", "items", "data").map(normLawyer).filter((l) => l.userId && l.name);
}

// GET /lawyers/{id}/services — ids of the services one seller offers (narrows the catalogue).
export async function getOfferedServiceIds(lawyerUserId: string): Promise<string[]> {
  const d = asDict(await http(`/lawyers/${encodeURIComponent(lawyerUserId)}/services`));
  return asArr(d.services).map((x) => asStr(asDict(x).id ?? asDict(x).service_id ?? x)).filter(Boolean);
}

export type MatchCandidate = { lawyerUserId: string; score: number; reasons: string[] };

// GET /matching/candidates — verified sellers ranked by score for a service (best first).
export async function getCandidates(serviceId: string, region = ""): Promise<MatchCandidate[]> {
  const qs = new URLSearchParams({ service_id: serviceId, urgency: "normal" });
  if (region) qs.set("region", region);
  return listFrom(await http(`/matching/candidates?${qs}`), "items", "data", "candidates").map((x) => {
    const d = asDict(x);
    return { lawyerUserId: asStr(d.lawyer_user_id), score: asNum(d.score), reasons: asArr(d.reasons).map((r) => asStr(r)).filter(Boolean) };
  });
}
