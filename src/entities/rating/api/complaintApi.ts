import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { ComplaintItem, WorkRef } from "../model/complaint";
import { first, manual, quality, workRef } from "./complaintNorm";

const rowsOf = (raw: unknown): unknown[] => (Array.isArray(raw) ? raw : asArr(asDict(raw).items ?? asDict(raw).data));
const LIMIT = 100;

// Every page of /clients/me/works (the backend caps one page), as the web does.
async function allWorks(query: string): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for (let page = 0, off = 0; page < 10; page++) {
    const d = asDict(await http(`/clients/me/works?${query}limit=${LIMIT}&offset=${off}`));
    const rows = asArr(d.items).map(asDict);
    out.push(...rows);
    off += rows.length;
    if (!rows.length || off >= asNum(d.total, off)) break;
  }
  return out;
}

export type ComplaintFeed = { items: ComplaintItem[]; partial: boolean; manualFailed: boolean; qualityFailed: boolean };

// Complaints the client wrote (GET /complaints) + quality complaints a low rating opened.
export async function listComplaints(): Promise<ComplaintFeed> {
  const [m, q] = await Promise.allSettled([http("/complaints"), allWorks("type=quality_complaint&")]);
  if (m.status === "rejected" && q.status === "rejected") throw m.reason;
  const a = m.status === "fulfilled" ? rowsOf(m.value).map(manual) : [];
  const b = q.status === "fulfilled" ? q.value.filter((x) => asStr(x.type) === "quality_complaint" || asStr(x.source) === "quality_complaint").map(quality) : [];
  const t = (x: ComplaintItem) => Date.parse(x.createdAt) || 0;
  const items = [...a, ...b].filter((x) => x.id).sort((x, y) => t(y) - t(x));
  return { items, partial: m.status === "rejected" || q.status === "rejected", manualFailed: m.status === "rejected", qualityFailed: q.status === "rejected" };
}

// Verdict details of a quality complaint: rating, comment, operator's note (GET /clients/me/works/{id}).
export async function getComplaintDetail(c: ComplaintItem): Promise<ComplaintItem> {
  const d = asDict(await http(`/clients/me/works/${encodeURIComponent(c.workId || c.id)}`));
  const sum = asDict(d.summary);
  const p = asDict(asDict(d.complaint).payload);
  const review = asDict(d.review);
  return {
    ...c,
    status: first(sum.status, asDict(d.complaint).status, c.status),
    stars: asNum(p.rating) || asNum(review.rating),
    description: c.description || first(p.comment, review.comment),
    lawyerName: first(review.lawyer_name, asDict(sum.assigned_lawyer).name, c.lawyerName),
    operatorName: first(p.operator_name, asDict(sum.operator).name, c.operatorName),
    operatorNote: first(p.operator_note, c.operatorNote),
    resolvedAt: first(p.resolved_at),
    updatedAt: first(sum.updated_at, c.updatedAt),
    workTitle: first(p.document_title, p.service_title, asDict(d.document).title),
  };
}

export type NewComplaint = { category: string; subject: string; description: string; relatedRef: string };

export async function fileComplaint(i: NewComplaint): Promise<ComplaintItem> {
  const body = { category: i.category, subject: i.subject, description: i.description, ...(i.relatedRef ? { case_id: i.relatedRef } : {}) };
  return manual(await http("/complaints", { method: "POST", body }));
}

// The client's works a complaint can point at (not complaints themselves).
export async function listComplaintTargets(): Promise<WorkRef[]> {
  return (await allWorks("")).filter((w) => !/complaint/.test(asStr(w.type))).map(workRef).filter((w) => w.id);
}

// The work a manual complaint was filed about (GET /clients/me/works/{ref} → summary).
export async function getWorkRef(ref: string): Promise<WorkRef> {
  return workRef(asDict(await http(`/clients/me/works/${encodeURIComponent(ref)}`)).summary);
}
