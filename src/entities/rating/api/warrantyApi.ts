import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

export type WarrantyClaim = { id: string; workId: string; status: string; reason: string; kind: string; createdAt: string };

function norm(v: unknown): WarrantyClaim {
  const d = asDict(v);
  const p = asDict(d.payload);
  return { id: asStr(d.id), workId: asStr(d.work_id), status: asStr(d.status, "new"), reason: asStr(p.reason ?? d.title), kind: asStr(d.record_type), createdAt: asStr(d.created_at) };
}

export const listWarranty = async (): Promise<WarrantyClaim[]> => listFrom(await http("/warranty/claims"), "items", "data").map(norm).filter((c) => c.id);

// The client's own lawyer-replacement requests (GET /replacement-requests/me).
export const listReplacements = async (): Promise<WarrantyClaim[]> => listFrom(await http("/replacement-requests/me"), "items", "data").map(norm).filter((c) => c.id);

// POST /warranty/claims — asks LexGo to replace the lawyer; a manager answers.
export const createWarranty = async (reason: string, caseRef: string): Promise<WarrantyClaim> =>
  norm(await http("/warranty/claims", { method: "POST", body: { reason, kind: "replacement", ...(caseRef ? { case_id: caseRef } : {}) } }));
