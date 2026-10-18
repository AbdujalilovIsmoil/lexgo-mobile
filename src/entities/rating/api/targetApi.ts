import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { listMarketOrders } from "@/entities/order/api/marketApi";
import { normWindow } from "../lib/window";
import type { RateTarget } from "../model/types";

const DONE = new Set(["completed", "result_ready", "delivered", "closed"]);

// GET /clients/me/works/{work id} → what can be rated and the rating window the backend reports.
export async function getRateTarget(ref: string): Promise<RateTarget> {
  const d = asDict(await http(`/clients/me/works/${encodeURIComponent(ref)}`));
  const at = Date.now();
  const sum = asDict(d.summary);
  const type = asStr(d.type ?? sum.type);
  const base = { workId: asStr(sum.work_id, ref), title: asStr(sum.title), status: asStr(sum.status) };
  const lawyer = asDict(sum.assigned_lawyer);
  if (type === "urgent_advokat") {
    const u = asDict(d.urgent_request);
    return { ...base, kind: "urgent", recordId: asStr(u.id), lawyerName: asStr(lawyer.name), lawyerUserId: asStr(lawyer.id), window: normWindow(u.rating, asDict(u.payload), at) };
  }
  if (type === "document_lawyer_work") {
    const doc = asDict(d.document);
    return { ...base, kind: "document", recordId: asStr(doc.id), lawyerName: asStr(lawyer.name), lawyerUserId: asStr(lawyer.id), window: normWindow(d.rating ?? doc.rating, doc, at) };
  }
  const o = asDict(d.order);
  // A marketplace order: the same 15-minute window, read from the order's own `rating` and posted to its `rating_url`.
  const mk = (await listMarketOrders().catch(() => [])).find((x) => x.id === asStr(o.id) || x.workId === base.workId || x.workId === ref);
  if (mk?.rating) {
    const r = mk.rating;
    const win = normWindow({ available: r.available, submitted: mk.ratingSubmitted, remaining_seconds: r.remainingSeconds, deadline_at: r.deadlineAt, closed_reason: r.reason }, {}, r.fetchedAt);
    return { ...base, kind: "market", recordId: mk.id, ratingUrl: mk.ratingUrl, lawyerName: mk.lawyerName, lawyerUserId: mk.lawyerUserId, window: win };
  }
  const done = DONE.has(base.status);
  const win = normWindow({ available: done, submitted: false, remaining_seconds: 0 }, {}, at);
  return { ...base, kind: "review", recordId: asStr(o.id), lawyerName: asStr(o.lawyer_name ?? lawyer.name), lawyerUserId: asStr(o.lawyer_user_id ?? lawyer.id), window: win };
}
