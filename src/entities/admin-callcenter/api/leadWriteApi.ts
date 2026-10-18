import { http } from "@/shared/api";
import type { BoardLead } from "../model/boardTypes";

// PATCH /admin/leads/{id} (leads.manage). `details` is replaced whole, so the current ones are merged in.
// The backend column assigned_operator_user_id is set together with the web's details.assigned_to_user_id.
export async function assignLead(lead: BoardLead, userId: string, byUserId: string): Promise<void> {
  const details: Record<string, unknown> = { ...lead.details };
  if (userId) Object.assign(details, { assigned_to_user_id: userId, assigned_at: new Date().toISOString(), assigned_by: byUserId });
  else ["assigned_to_user_id", "assigned_at", "assigned_by"].forEach((k) => delete details[k]);
  await http(`/admin/leads/${lead.id}`, { method: "PATCH", body: { assigned_operator_user_id: userId, details } });
}

// Lost reason is stored in the lead details before the card lands in a "lost" column (best effort, as on the web).
export async function saveLostReason(lead: BoardLead, reason: string, note: string): Promise<void> {
  const details = { ...lead.details, lost_reason: reason, lost_note: note, lost_at: new Date().toISOString() };
  await http(`/admin/leads/${lead.id}`, { method: "PATCH", body: { details } });
}
