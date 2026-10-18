import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { TimelineItem } from "../model/types";
import { leadsBase, type LeadScope } from "./scope";

// GET …/leads/{id}/timeline — newest first; the type says what happened, the payload the details.
export async function getTimeline(scope: LeadScope, leadId: string): Promise<TimelineItem[]> {
  return listFrom(await http(`${leadsBase(scope)}/${leadId}/timeline`), "items", "data", "timeline").map((v) => {
    const d = asDict(v);
    const p = asDict(d.payload);
    return {
      id: asStr(d.id),
      type: asStr(d.record_type ?? d.action ?? d.type),
      detail: asStr(p.reason ?? p.note ?? d.detail ?? d.description),
      from: asStr(p.from),
      to: asStr(p.to),
      createdAt: asStr(d.created_at),
    };
  });
}

// POST /admin/leads/{id}/re-engage — the backend stores the text as `reason` (the web sends `note`).
export async function reengageLead(leadId: string, note: string): Promise<void> {
  await http(`/admin/leads/${leadId}/re-engage`, { method: "POST", body: { note, reason: note } });
}

// POST /call-center/calls — logs an outgoing call to the lead's phone.
export async function logLeadCall(i: { phone: string; clientUserId: string; note: string }): Promise<void> {
  const body = { direction: "outgoing", phone: i.phone, note: i.note, ...(i.clientUserId ? { client_user_id: i.clientUserId } : {}) };
  await http("/call-center/calls", { method: "POST", body });
}

// POST /tasks — a follow-up task due on `dueDate` (YYYY-MM-DD).
export async function createReminder(title: string, dueDate: string): Promise<void> {
  await http("/tasks", { method: "POST", body: { title, priority: "medium", due_date: dueDate } });
}
