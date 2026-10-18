import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

// An advocate is working on this very document (TZ 14): a new advocate request is
// refused until it ends, and the constructor asks before it opens.
export type ServiceHold = {
  requestId: string;
  workId: string;
  canSend: boolean;
  reason: string;
  prompt: boolean;
  promptTitle: string;
  promptText: string;
};

const HELD = ["open_pool", "lawyer_review"];

// GET /document-requests/service-flow keeps `lawyer_request_active` per row; only
// `status` filters server-side, so the two holding statuses are read and matched here.
export async function getServiceHold(serviceId: string): Promise<ServiceHold | null> {
  const pages = await Promise.all(HELD.map((s) => http(`/document-requests/service-flow?status=${s}&limit=100`).catch(() => null)));
  for (const row of pages.flatMap((p) => listFrom(p, "items"))) {
    const d = asDict(row);
    if (asStr(asDict(d.service).id) !== serviceId || !d.lawyer_request_active) continue;
    const ca = asDict(d.constructor_action);
    const req = asDict(d.document_request);
    return {
      requestId: asStr(d.id),
      workId: asStr(asDict(d.lawyer_request).work_id ?? req.work_id),
      canSend: d.can_send_lawyer_request !== false,
      reason: asStr(d.lawyer_request_block_reason),
      prompt: ca.prompt_required === true,
      promptTitle: asStr(ca.title),
      promptText: asStr(ca.message),
    };
  }
  return null;
}
