// Sales pipeline (GET /admin/leads/kanban): columns hold leads; the assignee is the lead's operator.
export type Lead = {
  id: string;
  workId: string;
  name: string;
  phone: string;
  source: string;
  category: string;
  region: string;
  urgency: string;
  note: string;
  status: string;
  score: string; // hot | warm | cold | ""
  createdAt: string;
  details: Record<string, unknown>; // raw details (PATCH replaces them, so callers merge)
  assignedTo: string; // operator user id ("" = unassigned)
  assignedAt: string;
  assignedBy: string;
  clientUserId: string; // platform user behind the lead, when known
};
export type Column = { key: string; title: string; color: string; order: number; isFinal: boolean; count: number; leads: Lead[] };
export type ColumnInput = { key: string; title: string; color: string; order: number; isFinal: boolean };
export type Operator = { id: string; name: string; phone: string; region: string; lexgoId: string };
export type TimelineItem = { id: string; type: string; detail: string; from: string; to: string; createdAt: string };
export type LeadFilter = { q: string; region: string; source: string; score: string; urgency: string; assignee: string; from: string; to: string };
export type LeadDraft = { name: string; phone: string; category: string; region: string; note: string; operatorId: string };
export type LeadEdit = { name: string; phone: string; category: string; region: string; urgency: string; note: string };
export type AssignStrategy = "round_robin" | "least_loaded";
export type Assignment = { lead: Lead; operator: Operator };
export type OpsStatus = "loading" | "ready" | "forbidden" | "error";
