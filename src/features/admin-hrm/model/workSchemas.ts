import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { isTime } from "@/entities/admin-hrm";
import { dateOpt } from "./peopleSchemas";

// Text validation for the work forms (schedule, message, payroll, task, KPI, comment).
const day = z.object({ on: z.boolean(), start: z.string(), end: z.string() });
const daysOk = (d: z.infer<typeof day>[]) => d.some((x) => x.on) && d.every((x) => !x.on || (isTime(x.start) && isTime(x.end)));

export const scheduleSchema = z.object({ title: rules.text(1, 160), employeeId: z.string(), unitId: z.string(), days: z.array(day).refine(daysOk, rules.m("time")) });
export const messageSchema = z.object({ subject: rules.text(1, 160), body: rules.text(1, 4000) });
export const payrollSchema = z.object({
  employeeId: z.string(), period: z.string(), type: z.string(),
  amount: rules.numText(0).refine((v) => Number(v) > 0, rules.m("range", 1)), title: rules.optText(300),
});
export const taskSchema = z.object({
  title: rules.text(1, 200), description: rules.optText(4000), project: rules.optText(80),
  employeeId: z.string(), unitId: z.string(), priority: z.string(), deadline: dateOpt,
});
export const kpiSchema = z.object({
  employeeId: z.string(), period: z.string(), title: rules.text(1, 160),
  target: rules.intText(1), actual: rules.optIntText(), weight: rules.optIntText(), source: z.string(),
});
export const commentSchema = z.object({ comment: rules.optText(2000) });
