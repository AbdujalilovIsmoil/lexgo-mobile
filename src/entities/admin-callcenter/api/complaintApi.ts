import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { ComplaintAction, ComplaintDetail, ComplaintList, Complaint } from "../model/complaintTypes";

function normRow(v: unknown): Complaint {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    status: asStr(d.status, "new"),
    title: asStr(d.title),
    lawyerName: asStr(asDict(d.assigned_lawyer ?? d.lawyer).name),
    nextAction: asStr(d.next_action),
    hasUrgent: Boolean(asStr(d.urgent_advokat_request_id)),
    createdAt: asStr(d.created_at),
  };
}

// GET /call-center/quality-complaints[?status=] — opened by the backend on 1–2 star ratings.
export async function listComplaints(status = ""): Promise<ComplaintList> {
  const d = asDict(await http(`/call-center/quality-complaints${status ? `?status=${encodeURIComponent(status)}` : ""}`));
  const items = listFrom(d, "items", "data").map(normRow);
  return { items, count: asNum(d.count, items.length), statuses: asArr(d.statuses).map((x) => asStr(x)).filter(Boolean) };
}

// GET …/{id}: the summary plus the complaint record, the document or urgent request behind it and the allowed rulings.
export async function getComplaint(id: string): Promise<ComplaintDetail> {
  const d = asDict(await http(`/call-center/quality-complaints/${encodeURIComponent(id)}`));
  const p = asDict(asDict(d.complaint).payload);
  const doc = asDict(d.document ?? d.document_request);
  const cf = asDict(doc.contract_file);
  const filePath = asStr(cf.inline_url ?? cf.download_url);
  const urg = asDict(d.urgent_request ?? d.urgent_advokat_request);
  const up = asDict(urg.payload);
  const u = (k: string) => asStr(urg[k] ?? up[k]);
  return {
    row: normRow(d.summary ?? d.complaint ?? d),
    clientName: asStr(p.client_name),
    clientPhone: asStr(p.client_phone),
    rating: asNum(p.rating),
    complaint: asStr(p.complaint ?? p.comment ?? p.description ?? p.text),
    priority: asStr(p.priority),
    operatorNote: asStr(p.operator_note),
    resolvedAction: asStr(p.resolved_action),
    docTitle: asStr(doc.title),
    docStatus: asStr(doc.status),
    docWorkId: asStr(doc.work_id),
    docFile: filePath ? { path: filePath, name: asStr(cf.file_name) || asStr(doc.title) || "document", mime: asStr(cf.mime_type) } : null,
    urgentTitle: u("title") || u("service_title") || u("service_kind"),
    urgentNeed: u("need") || u("description"),
    urgentStatus: u("status"),
    urgentWorkId: u("work_id"),
    actions: asArr(d.actions).map((x) => asStr(asDict(x).key)).filter(Boolean),
  };
}

// POST …/{id}/resolve — rework_required reopens the work for the same advocate (free), rejected closes it with a note, resolved closes it.
export async function resolveComplaint({ id, action, note }: { id: string; action: ComplaintAction; note: string }): Promise<void> {
  await http(`/call-center/quality-complaints/${encodeURIComponent(id)}/resolve`, { method: "POST", body: { action, note } });
}
