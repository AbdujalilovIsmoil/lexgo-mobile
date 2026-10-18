import { asDict, asStr } from "@/shared/lib/json";
import type { WorkComplaint } from "../model/detailTypes";

// A complaint record (module quality_complaint or complaint). The phone and
// other client fields inside its payload are not read.
export function normComplaint(v: unknown): WorkComplaint {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id) || asStr(p.work_id),
    status: asStr(d.status).toLowerCase(),
    reason: asStr(p.reason),
    text: asStr(p.description ?? p.complaint ?? p.comment ?? p.text),
    operatorNote: asStr(p.operator_note),
    resolvedAction: asStr(p.resolved_action),
    createdAt: asStr(d.created_at),
  };
}
