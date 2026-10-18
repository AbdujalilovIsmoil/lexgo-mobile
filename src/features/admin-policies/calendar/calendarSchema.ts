import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { isDate } from "@/shared/ui/admin";

// A real calendar day typed as YYYY-MM-DD.
const day = rules.date.refine(isDate, rules.m("date"));

// Public holiday: the day is required, the name is optional (a default is used when empty).
export const holidaySchema = z.object({ day, title: rules.optText(80) });
// "What if an order arrives at …": a day and a 24-hour time.
export const simulateSchema = z.object({ day, time: rules.time });
