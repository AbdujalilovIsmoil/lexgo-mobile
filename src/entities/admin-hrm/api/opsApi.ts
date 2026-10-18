import { hrmGet, hrmPath, hrmPost } from "./core";
import { hrmListAll } from "./opsAll";
import { normBlocks, normKpi, normPayroll, normSummary } from "./normOps";

export type KpiInput = { employeeId: string; period: string; title: string; target: number; actual: number; weight: number; source: string };
export type PayrollInput = { employeeId: string; period: string; type: string; amount: number; title: string };

export const listKpis = async (p: { employee_id?: string; period?: string }) => (await hrmListAll("/kpi/metrics", p)).map(normKpi);
export const createKpi = async (i: KpiInput) =>
  normKpi(await hrmPost("/kpi/metrics", {
    employee_id: i.employeeId, period: i.period, metric_code: i.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "metric", title: i.title,
    target_value: i.target, actual_value: i.actual, score: 0, weight: i.weight, source: i.source, status: "active", meta: {},
  }));

export const listPayroll = async (p: { employee_id?: string; period?: string }) => (await hrmListAll("/payroll/entries", p)).map(normPayroll);
export const getPayrollSummary = async (period: string) => normSummary(await hrmGet("/payroll/summary", { period }));
export const createPayroll = async (i: PayrollInput) =>
  normPayroll(await hrmPost("/payroll/entries", {
    employee_id: i.employeeId, period: i.period, entry_type: i.type, title: i.title || i.type, amount: i.amount, currency: "UZS", status: "draft", paid_at: null, meta: {},
  }));

type Range = { date_from?: string; date_to?: string };
export const getAnalytics = async (r: Range) => normBlocks(await hrmGet("/analytics/dashboard", r));
export const analyticsExportPath = (r: Range) => hrmPath("/analytics/export.xlsx", r);
