import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { Candidate } from "../model/types";

export function normCandidate(v: unknown): Candidate {
  const d = asDict(v);
  return {
    id: asStr(d.lawyer_user_id) || asStr(asDict(d.user).id),
    name: asStr(d.name) || asStr(asDict(d.user).name),
    kind: asStr(d.seller_type) || asStr(d.role),
    region: asStr(d.region),
    rating: asNum(d.rating),
    workload: asNum(d.workload),
    callCenter: d.is_callcenter_member === true,
  };
}
