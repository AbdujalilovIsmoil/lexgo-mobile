import { http } from "@/shared/api";
import type { ColumnInput } from "../model/types";
import { leadsBase, type LeadScope } from "./scope";

// PUT …/leads/kanban/columns — a bare list merged by key; columns not in it stay untouched.
export async function saveColumns(scope: LeadScope, columns: ColumnInput[]): Promise<void> {
  const body = columns.map((c) => ({ key: c.key, title: c.title, color: c.color || "#6b7280", order: c.order, is_final: c.isFinal }));
  await http(`${leadsBase(scope)}/kanban/columns`, { method: "PUT", body });
}

// DELETE /admin/leads/kanban/columns/{key} — a column that holds leads needs `reassign_to` (409 otherwise).
export async function deleteColumn(key: string, reassignTo?: string): Promise<void> {
  const qs = reassignTo ? `?reassign_to=${encodeURIComponent(reassignTo)}` : "";
  await http(`/admin/leads/kanban/columns/${encodeURIComponent(key)}${qs}`, { method: "DELETE" });
}
