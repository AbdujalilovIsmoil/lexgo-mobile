import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { Complaint } from "../model/types";

function norm(v: unknown): Complaint {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id), workId: asStr(d.work_id), category: asStr(d.record_type ?? d.category), title: asStr(d.title ?? d.subject),
    description: asStr(p.description ?? d.description), status: asStr(d.status, "new"), priority: asStr(p.priority), caseRef: asStr(p.case_id),
    ownerId: asStr(d.owner_user_id), createdAt: asStr(d.created_at), updatedAt: asStr(d.updated_at),
  };
}

// GET /admin/complaints — every complaint of every client (a plain array, no paging).
export async function listComplaints(): Promise<Complaint[]> {
  return listFrom(await http("/admin/complaints"), "items", "data").map(norm).filter((c) => c.id);
}
