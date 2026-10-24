import { ApiError, http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { normCaps, normChecklist, normCheckItem, normFinancials, normTimeline } from "./norm";
import type { CheckFile, CheckStatus, Checklist, Financials, FlowEvent, RuntimeCaps, WarrantyKind, WarrantyResolution } from "../model/types";

const enc = encodeURIComponent;
const me = (id: string) => `/marketplace/me/orders/${enc(id)}`;
// A URL the backend handed over (it may be absolute): the path part only, so `http` keeps its own base and auth.
const own = (url: string, fallback: string) => url.replace(/^https?:\/\/[^/]+/i, "") || fallback;

export const getFinancials = async (orderId: string, url = ""): Promise<Financials> => normFinancials(await http(own(url, `${me(orderId)}/financials`)));

export const getChecklist = async (orderId: string, url = ""): Promise<Checklist> => normChecklist(await http(own(url, `/marketplace/orders/${enc(orderId)}/checklist`)), orderId);

export const getTimeline = async (orderId: string): Promise<FlowEvent[]> => normTimeline(await http(`${me(orderId)}/timeline`));

// One request per app run (cleared when it fails, so the next screen asks again).
let caps: Promise<RuntimeCaps> | null = null;
export function getRuntimeCaps(): Promise<RuntimeCaps> {
  caps ??= http("/marketplace/runtime-capabilities").then(normCaps, (e: unknown) => {
    caps = null;
    throw e;
  });
  return caps;
}

export type CheckPatch = { status: CheckStatus; comment?: string; files?: CheckFile[]; images?: CheckFile[] };

// PATCH one checklist item: done / skipped (the reason goes in `comment`) / back to pending, with its proof. Answers with the item or the
// whole list; the caller refetches either way.
export async function patchCheckItem(orderId: string, itemId: string, p: CheckPatch) {
  const body: Record<string, unknown> = { status: p.status };
  if (p.comment !== undefined) body.comment = p.comment.trim();
  if (p.files) body.files = p.files.filter((f) => f.id).map((f) => ({ id: f.id, name: f.name }));
  if (p.images) body.images = p.images.filter((f) => f.id).map((f) => ({ id: f.id, name: f.name }));
  const d = asDict(await http(`/marketplace/orders/${enc(orderId)}/checklist/${enc(itemId)}`, { method: "PATCH", body }));
  return Object.keys(asDict(d.item)).length ? normCheckItem(d.item) : null;
}

// TZ §10: the complaint is its own action (POST …/complaint {reason}), separate from the rating.
export async function fileOrderComplaint(orderId: string, url: string, reason: string): Promise<void> {
  await http(own(url, `${me(orderId)}/complaint`), { method: "POST", body: { reason: reason.trim() } });
}

// TZ §11: a warranty request goes to the call center; the answer is only "received" — the decision comes later.
export async function createOrderWarranty(orderId: string, url: string, v: { kind: WarrantyKind; resolution: WarrantyResolution; reason: string }) {
  const d = asDict(await http(own(url, `${me(orderId)}/warranty`), { method: "POST", body: { kind: v.kind, resolution: v.resolution, reason: v.reason.trim() } }));
  const w = asDict(d.warranty ?? d.claim ?? d);
  return { status: asStr(w.status).toLowerCase() || "new", resolution: asStr(w.resolution ?? v.resolution).toLowerCase() };
}

// TZ §9: start the work. The order's own `start_url` when the backend offers it, else PATCH /orders/{id}/status in_progress.
export async function startOrder(orderId: string, startUrl: string, note: string): Promise<void> {
  if (startUrl) {
    await http(own(startUrl, startUrl), { method: "POST" });
    return;
  }
  await http(`/orders/${enc(orderId)}/status`, { method: "PATCH", body: { status: "in_progress", note: note.trim() || "Work started" } });
}

export type ResultRef = { id: string; name: string; url: string };
const missing = (e: unknown) => e instanceof ApiError && !e.code && (e.status === 405 || (e.status === 404 && (!e.detail || /^not found$/i.test(e.detail.trim()))));

// TZ §9: complete with the result (text and/or at least one file). complete-v2 checks the checklist; an older backend without it gets the
// first completion endpoint.
export async function completeWithResult(orderId: string, text: string, files: ResultRef[]): Promise<void> {
  const t = text.trim();
  if (!t && !files.length) throw new ApiError(422, undefined, { code: "marketplace_result_required" });
  try {
    await http(`/marketplace/orders/${enc(orderId)}/complete-v2`, { method: "POST", body: { result_text: t, result_files: files.map((f) => ({ id: f.id, name: f.name })) } });
  } catch (e) {
    if (!missing(e)) throw e;
    await http(`${me(orderId)}/complete`, { method: "POST", body: { ...(t ? { result_text: t } : {}), ...(files.length ? { result_files: files.map((f) => ({ file_id: f.id, file_name: f.name, download_url: f.url })) } : {}) } });
  }
}
