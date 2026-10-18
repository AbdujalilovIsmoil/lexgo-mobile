import type { Employee } from "./types";
import type { Task } from "./typesWork";

export type AttendanceDay = {
  id: string; employeeId: string; date: string; status: string; planned: number; worked: number; late: number;
  early: number; overtime: number; firstIn: string; lastOut: string; // minutes, ISO times
};
export type WeekDay = { day: string; start: string; end: string; breakMinutes: number };
export type Schedule = {
  id: string; employeeId: string; unitId: string; title: string; type: string; timezone: string;
  weekly: WeekDay[]; status: string; from: string; to: string;
};
export type Kpi = {
  id: string; employeeId: string; period: string; code: string; title: string; target: number; actual: number;
  score: number; weight: number; source: string; status: string;
};
export type PayrollEntry = {
  id: string; employeeId: string; period: string; type: string; title: string; amount: number; currency: string; status: string; paidAt: string;
};
export type PayrollSummary = { period: string; count: number; total: number; byType: Record<string, number> };
export type AnalyticsBlock = { key: string; values: { key: string; value: number }[] };
export type Analytics = { blocks: AnalyticsBlock[] };
export type Today = { date: string; attendance: AttendanceDay | null; tasks: Task[]; pendingApprovals: number; name: string };
export type MyKpis = { period: string; score: number; items: Kpi[] };
export type Profile = { name: string; phone: string; employee: Employee | null };
export type Employee360 = {
  employee: Employee; tasks: Task[]; attendance: AttendanceDay[]; kpis: Kpi[]; payroll: PayrollEntry[];
};
