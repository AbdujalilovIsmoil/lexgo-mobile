import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { CaseAiTool, CaseDoc, TimelineItem } from "../model/types";

// GET /cases/{id}/timeline — newest first (records of module "case_timeline").
export async function caseTimeline(id: string): Promise<TimelineItem[]> {
  const rows = listFrom(await http(`/cases/${encodeURIComponent(id)}/timeline`), "items", "data").map((v) => {
    const d = asDict(v);
    const p = asDict(d.payload);
    return { id: asStr(d.id), kind: asStr(d.record_type), title: asStr(d.title), stage: asStr(p.stage), status: asStr(p.status), nextAction: asStr(p.next_action), createdAt: asStr(d.created_at) };
  });
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// GET/POST /case-documents — title-only records linked to a case through payload.case_id.
const normDoc = (v: unknown): CaseDoc => {
  const d = asDict(v);
  return { id: asStr(d.id), workId: asStr(d.work_id), title: asStr(d.title), status: asStr(d.status), caseId: asStr(asDict(d.payload).case_id), createdAt: asStr(d.created_at) };
};
export async function listCaseDocs(caseId: string): Promise<CaseDoc[]> {
  return listFrom(await http("/case-documents"), "items", "data").map(normDoc).filter((x) => x.caseId === caseId);
}
export const addCaseDoc = async (caseId: string, title: string): Promise<CaseDoc> =>
  normDoc(await http("/case-documents", { method: "POST", body: { title, record_type: "case_document", payload: { case_id: caseId } } }));

// POST /ai/cases/{id}/tools — AI helpers over one case (PII masked on the server).
export async function runCaseAi(caseId: string, tool: CaseAiTool): Promise<string> {
  const d = asDict(await http(`/ai/cases/${encodeURIComponent(caseId)}/tools`, { method: "POST", body: { tool, file_version_ids: [] } }));
  return asStr(d.result);
}

