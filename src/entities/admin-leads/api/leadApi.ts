import { http } from "@/shared/api";
import type { Column, Lead, LeadDraft } from "../model/types";
import { normColumns, normLead } from "./normalize";
import { leadsBase, type LeadScope } from "./scope";

// GET …/kanban — the whole board; filters are applied on the device.
export async function getBoard(scope: LeadScope): Promise<Column[]> {
  return normColumns(await http(`${leadsBase(scope)}/kanban`));
}

// POST …/leads — without an operator the backend assigns the least loaded one.
export async function createLead(scope: LeadScope, d: LeadDraft): Promise<Lead> {
  const body = {
    source: "manual",
    category: d.category,
    region: d.region,
    urgency: "",
    details: { name: d.name, phone: d.phone, note: d.note },
    ...(d.operatorId ? { assigned_operator_user_id: d.operatorId } : {}),
  };
  return normLead(await http(leadsBase(scope), { method: "POST", body }));
}

// PATCH …/leads/{id} — `details` is replaced whole (the kanban key is kept server-side), so callers merge.
export async function updateLead(scope: LeadScope, id: string, patch: Record<string, unknown>): Promise<Lead> {
  return normLead(await http(`${leadsBase(scope)}/${id}`, { method: "PATCH", body: patch }));
}

// PATCH …/leads/{id}/move — lands the lead at `position` of the target column (400 lists the allowed columns).
export async function moveLead(scope: LeadScope, id: string, columnKey: string, position: number): Promise<void> {
  await http(`${leadsBase(scope)}/${id}/move`, { method: "PATCH", body: { column_key: columnKey, position } });
}

// DELETE /admin/leads/{id} — admin prefix only.
export async function deleteLead(id: string): Promise<void> {
  await http(`/admin/leads/${id}`, { method: "DELETE" });
}
