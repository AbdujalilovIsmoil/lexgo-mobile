// Region + period filter of the dashboards, sent as ?region=&date_from=&date_to=.
export type DashFilter = { region: string; from: string; to: string };
export const EMPTY_FILTER: DashFilter = { region: "", from: "", to: "" };

export type Point = { label: string; value: number };
export type DashListItem = { id: string; title: string; status: string; meta: string; amount?: number; date: string };
export type DrillMetric = "users" | "clients" | "yurists" | "advokats" | "orders" | "cases" | "leads" | "payments" | "tasks" | "b2b_clients" | "reviews";

// GET /admin/dashboard: flat counters, named chart series and four short record lists.
export type AdminDash = {
  stats: Record<string, number>;
  charts: Record<string, Point[]>;
  lists: { tasks: DashListItem[]; b2bClients: DashListItem[]; reviews: DashListItem[]; gifts: DashListItem[] };
};

// GET /quality/overview
export type Quality = {
  avgRating: number;
  responseSlaPct: number;
  complaintRate: number;
  resolvedPct: number;
  flagged: { title: string; detail: string; severity: string }[];
};

// GET /calls/analytics
export type CallStats = {
  total: number;
  answered: number;
  missed: number;
  avgDurationSec: number;
  byDay: Point[];
  topAgents: { name: string; calls: number }[];
};
