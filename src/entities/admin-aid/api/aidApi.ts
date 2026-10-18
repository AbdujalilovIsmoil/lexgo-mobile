import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { AidDetail, AidRequest } from "../model/types";

// A legal-aid request is a generic module record; the citizen's data sits in `payload`.
export function normAid(v: unknown): AidRequest {
  const d = asDict(v);
  const p = asDict(d.payload);
  const title = asStr(d.title);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id ?? p.work_id),
    title,
    status: asStr(d.status),
    name: asStr(p.name),
    phone: asStr(p.phone),
    details: asStr(p.details) || title,
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}

// GET /legal-aid/requests — the whole inbox (no paging on the server).
export async function listAid(): Promise<AidRequest[]> {
  return listFrom(await http("/legal-aid/requests"), "items", "data").map(normAid);
}

// GET /legal-aid/requests/{id} — adds where the request came from and who created it.
export async function getAid(id: string): Promise<AidDetail> {
  const d = asDict(await http(`/legal-aid/requests/${encodeURIComponent(id)}`));
  const by = asDict(d.created_by);
  return {
    request: normAid(d.request ?? d),
    source: asStr(d.source),
    event: asStr(d.event),
    createdByName: asStr(by.name),
    createdByUserId: asStr(d.created_by_user_id ?? by.id),
    explanation: asStr(d.explanation),
  };
}
