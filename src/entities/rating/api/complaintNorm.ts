import { asDict, asStr } from "@/shared/lib/json";
import type { ComplaintItem, WorkRef } from "../model/complaint";

export const first = (...v: unknown[]): string => v.map((x) => asStr(x).trim()).find(Boolean) ?? "";
const bare = (title: string): string => title.replace(/^shikoyat\s*:\s*/i, "").trim() || title.trim();

// A complaint the client wrote (GET /complaints).
export function manual(v: unknown): ComplaintItem {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    key: `manual-${asStr(d.id)}`, id: asStr(d.id), workId: first(d.work_id, p.work_id), kind: "manual", category: first(d.record_type, d.category),
    subject: first(d.title, d.subject), description: first(p.description, d.description), status: first(d.status) || "new", relatedRef: first(p.case_id, d.case_id),
    lawyerName: "", operatorName: first(p.operator_name), operatorNote: first(p.operator_note, p.resolution_note), stars: 0, source: "", workTitle: "",
    resolvedAt: first(p.resolved_at), createdAt: first(d.created_at), updatedAt: first(d.updated_at),
  };
}

// A quality complaint a 1–2 star rating opened (a "work" of type quality_complaint).
export function quality(v: unknown): ComplaintItem {
  const d = asDict(v);
  return {
    key: `quality-${asStr(d.id)}`, id: asStr(d.id), workId: first(d.work_id), kind: "quality", category: "", subject: bare(asStr(d.title)), description: "",
    status: first(d.status) || "new", relatedRef: "", lawyerName: first(asDict(d.assigned_lawyer).name), operatorName: first(asDict(d.operator).name),
    operatorNote: "", stars: 0, source: first(d.urgent_advokat_request_id) ? "urgent" : first(d.document_request_id) ? "document" : "", workTitle: "",
    resolvedAt: "", createdAt: first(d.created_at), updatedAt: first(d.updated_at),
  };
}

export const workRef = (v: unknown): WorkRef => {
  const d = asDict(v);
  return { id: asStr(d.id), workId: asStr(d.work_id), type: asStr(d.type), title: first(d.title, d.document_title) };
};
