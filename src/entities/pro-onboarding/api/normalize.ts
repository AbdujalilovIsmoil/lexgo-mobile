import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { OnbDoc, OnbProgress } from "../model/types";

export function normProgress(v: unknown): OnbProgress {
  const d = asDict(v);
  const steps = asArr(d.steps).map((x) => {
    const r = asDict(x);
    return { key: asStr(r.key), title: asStr(r.title), required: r.required !== false, completed: r.completed === true };
  });
  const review = asDict(d.review);
  return {
    status: asStr(d.status).toLowerCase(),
    completed: d.completed_count == null ? steps.filter((s) => s.completed).length : asNum(d.completed_count),
    total: d.total_count == null ? steps.length : asNum(d.total_count),
    steps,
    reason: asStr(d.rejection_reason ?? d.reject_reason ?? d.reason ?? d.review_note ?? review.reason ?? review.note).trim(),
  };
}

const DOC_FIELDS = ["document_type", "file_name", "filename", "file_url", "mime_type", "content_type"];

// Records of the seller-onboarding module that are uploaded proof files (the others are the sign-up form).
export function normDocs(list: unknown[]): OnbDoc[] {
  return list
    .map((v) => asDict(v))
    .filter((d) => DOC_FIELDS.some((f) => asDict(d.payload)[f] != null) || /doc|file|upload/i.test(asStr(d.record_type)))
    .map((d) => {
      const p = asDict(d.payload);
      return {
        id: asStr(d.id),
        workId: asStr(d.work_id),
        name: asStr(p.file_name ?? p.filename ?? d.title),
        kind: asStr(p.document_type ?? d.record_type),
        status: asStr(d.status).toLowerCase(),
        createdAt: asStr(d.created_at),
        reason: asStr(p.rejection_reason ?? p.reject_reason ?? p.reason ?? d.rejection_reason ?? d.reject_reason ?? d.review_note).trim(),
      };
    });
}
