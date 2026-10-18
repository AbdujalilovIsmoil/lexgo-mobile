import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { OnbDoc, OnbProgress, ProCabinet } from "../model/types";

export function normCabinet(v: unknown): ProCabinet {
  const d = asDict(v);
  const profile = asDict(d.profile);
  const ver = asDict(d.verification);
  const limited = d.limited_access === true;
  const a = asDict(d.available_actions);
  // An action the backend does not list follows the overall access level.
  const allowed = (k: string) => (a[k] == null ? !limited : a[k] === true);
  const status = typeof d.verification === "string" ? d.verification : asStr(ver.status ?? ver.verification_status ?? profile.verification_status);
  return {
    accountStatus: asStr(d.account_status).toLowerCase(),
    sellerType: asStr(d.seller_type ?? profile.seller_type).toLowerCase(),
    limitedAccess: limited,
    limitedReason: asStr(d.limited_reason),
    actions: { acceptOrders: allowed("accept_orders"), secureChat: allowed("secure_chat"), calls: allowed("calls") },
    verificationStatus: status.toLowerCase(),
    verified: ver.is_verified === true || ver.verified === true || profile.is_verified === true,
  };
}

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
