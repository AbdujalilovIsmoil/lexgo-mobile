import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

export type OpenCase = { id: string; number: string; type: string; stage: string; status: string; nextAction: string };

const norm = (v: unknown): OpenCase => {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    number: asStr(d.case_number ?? d.caseNumber ?? d.work_id),
    type: asStr(d.title ?? d.case_type ?? d.caseType),
    stage: asStr(d.stage),
    status: asStr(d.status),
    nextAction: asStr(d.next_action ?? d.nextAction),
  };
};

// GET /cases — the client's own cases (same call as law-main listCases).
export async function listOpenCases(): Promise<OpenCase[]> {
  return listFrom(await http("/cases"), "cases", "items", "data").map(norm);
}
