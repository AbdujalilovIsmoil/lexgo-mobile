import { ApiError, http } from "@/shared/api";
import { asDict, asNum, listFrom } from "@/shared/lib/json";
import type { DocPage, DocRow } from "../model/types";
import type { DocChat, MyDoc, UnlockPolicy } from "../model/docTypes";
import { normChat, normPolicy } from "./normMisc";
import { normDoc } from "./normDoc";
import { normFlow, normLite } from "./normRow";

export type FlowQuery = { mode?: string; status?: string; limit: number; offset: number };

// service-flow is paged and filters on the server; rows are heavy, so pages stay small.
export async function listFlow(q: FlowQuery): Promise<DocPage> {
  const qs = new URLSearchParams({ limit: String(q.limit), offset: String(q.offset) });
  if (q.mode) qs.set("mode", q.mode);
  if (q.status) qs.set("status", q.status);
  const raw = await http(`/document-requests/service-flow?${qs}`);
  const items = listFrom(raw, "items", "data").map(normFlow);
  const d = asDict(raw);
  const total = d.total === undefined ? q.offset + items.length : asNum(d.total);
  return { items, total, hasMore: items.length > 0 && q.offset + items.length < total };
}

// The light list: every document in ~700 bytes each (counts, search, work ids).
export const listLite = async (): Promise<DocRow[]> => listFrom(await http("/document-requests"), "items", "data", "requests").map(normLite);
export const getDoc = async (id: string): Promise<MyDoc> => normDoc(await http(`/document-requests/${encodeURIComponent(id)}`));
export const getPolicy = async (id: string): Promise<UnlockPolicy> => normPolicy(await http(`/document-requests/${encodeURIComponent(id)}/unlock-policy`));


// 404 = this request can never have a chat (a document nobody else holds): same as "not yet".
export async function getChat(id: string): Promise<DocChat> {
  try {
    return normChat(await http(`/document-requests/${encodeURIComponent(id)}/chat`));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return { available: false, roomId: "", message: e.detail ?? "" };
    throw e;
  }
}
