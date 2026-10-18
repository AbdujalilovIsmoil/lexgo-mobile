import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { isDate } from "@/shared/ui/admin";

// Text validation for the people forms (unit, position, employee, assignment); selects are plain strings.
export const dateOpt = z.string().refine((v) => v === "" || isDate(v), rules.m("date"));

export const unitSchema = z.object({ name: rules.text(1, 160), code: rules.text(1, 40), type: z.string(), parent: z.string(), status: z.string() });

export const positionSchema = z.object({
  title: rules.text(1, 160), code: rules.text(1, 40), category: rules.optText(80), grade: rules.optText(40), description: rules.optText(2000), status: z.string(),
});

export const employeeSchema = z.object({
  firstName: rules.text(1, 80), lastName: rules.optText(80), phone: rules.optText(40), email: rules.optEmail, region: rules.optText(80),
  status: z.string(), unitId: z.string(), positionId: z.string(), hireDate: dateOpt, userId: z.string(), userName: z.string(),
});

export const assignmentSchema = z.object({
  unitId: z.string(), positionId: z.string(), managerId: z.string(), kind: z.string(),
  salary: rules.optIntText(0, 1_000_000_000_000), rate: rules.optIntText(0, 100000),
});
