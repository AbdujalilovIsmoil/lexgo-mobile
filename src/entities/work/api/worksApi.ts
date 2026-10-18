import { http } from "@/shared/api";
import { asDict, asNum, listFrom } from "@/shared/lib/json";
import type { WorkDetail } from "../model/detailTypes";
import type { WorksPage } from "../model/types";
import { normDetail } from "./normDetail";
import { normWork } from "./normWork";

// The backend caps `limit` at 100 and ignores search, so the list is paged here
// and filtered on the device (see useWorks).
export const WORKS_PAGE = 100;

// GET /clients/me/works — every business process of the signed-in client.
export async function fetchWorksPage(offset: number): Promise<WorksPage> {
  const d = asDict(await http(`/clients/me/works?limit=${WORKS_PAGE}&offset=${offset}`));
  const items = listFrom(d, "items", "data").map(normWork);
  return { items, total: asNum(d.total, items.length) };
}

// GET /clients/me/works/{work_id} — `workId` is the public id (ADV-…, DOC-…, ORD-…).
export async function fetchWork(workId: string): Promise<WorkDetail> {
  return normDetail(await http(`/clients/me/works/${encodeURIComponent(workId)}`));
}
