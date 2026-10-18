import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { AnalyticsBlock, AttendanceDay, Kpi, PayrollEntry, PayrollSummary, Schedule } from "../model/typesOps";

export function normDay(v: unknown): AttendanceDay {
  const d = asDict(v);
  return {
    id: asStr(d.id), employeeId: asStr(d.employee_id), date: asStr(d.work_date), status: asStr(d.status), planned: asNum(d.planned_minutes),
    worked: asNum(d.worked_minutes), late: asNum(d.late_minutes), early: asNum(d.early_leave_minutes), overtime: asNum(d.overtime_minutes),
    firstIn: asStr(d.first_in_at), lastOut: asStr(d.last_out_at),
  };
}

export function normSchedule(v: unknown): Schedule {
  const d = asDict(v);
  return {
    id: asStr(d.id), employeeId: asStr(d.employee_id), unitId: asStr(d.org_unit_id), title: asStr(d.title), type: asStr(d.schedule_type),
    timezone: asStr(d.timezone), status: asStr(d.status, "active"), from: asStr(d.effective_from), to: asStr(d.effective_to),
    weekly: asArr(d.weekly).map((w) => {
      const x = asDict(w);
      return { day: asStr(x.day), start: asStr(x.start), end: asStr(x.end), breakMinutes: asNum(x.break_minutes) };
    }),
  };
}

export function normKpi(v: unknown): Kpi {
  const d = asDict(v);
  return {
    id: asStr(d.id), employeeId: asStr(d.employee_id), period: asStr(d.period), code: asStr(d.metric_code), title: asStr(d.title),
    target: asNum(d.target_value), actual: asNum(d.actual_value), score: asNum(d.score), weight: asNum(d.weight), source: asStr(d.source), status: asStr(d.status),
  };
}

export function normPayroll(v: unknown): PayrollEntry {
  const d = asDict(v);
  return {
    id: asStr(d.id), employeeId: asStr(d.employee_id), period: asStr(d.period), type: asStr(d.entry_type), title: asStr(d.title),
    amount: asNum(d.amount), currency: asStr(d.currency, "UZS"), status: asStr(d.status, "draft"), paidAt: asStr(d.paid_at),
  };
}

export function normSummary(v: unknown): PayrollSummary {
  const d = asDict(v);
  const by = asDict(d.by_type);
  return { period: asStr(d.period), count: asNum(d.entries_count), total: asNum(d.total_amount), byType: Object.fromEntries(Object.keys(by).map((k) => [k, asNum(by[k])])) };
}

// {blocks: {execution: {total: 5, open: 5}, …}} → one block per key, numeric values only.
export function normBlocks(v: unknown): AnalyticsBlock[] {
  const blocks = asDict(asDict(v).blocks);
  return Object.keys(blocks).map((key) => {
    const b = asDict(blocks[key]);
    return { key, values: Object.keys(b).filter((k) => typeof b[k] === "number").map((k) => ({ key: k, value: asNum(b[k]) })) };
  });
}
