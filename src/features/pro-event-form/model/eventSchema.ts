import { z } from "zod";
import { DEADLINE_KINDS } from "@/entities/pro-calendar";
import * as rules from "@/shared/form/rules";
import { isDay, isTime } from "@/shared/lib/pro/dates";

const day = z.string().refine(isDay, rules.m("date"));

// A calendar event: a title, a real day, a start time and (optionally) a later end time.
export const eventSchema = z
  .object({
    type: z.string(), title: rules.text(1, 200), date: day, start: z.string().refine(isTime, rules.m("time")),
    end: z.string().refine((v) => !v || isTime(v), rules.m("time")),
    location: rules.optText(300), reminder: z.string(), caseId: z.string(), cancelled: z.boolean(),
  })
  .refine((v) => !v.end || !isTime(v.start) || !isTime(v.end) || v.end > v.start, { path: ["end"], message: rules.m("time") });

// Deadline calculator: the kind of deadline and the date it counts from.
export const deadlineSchema = z.object({ kind: z.enum(DEADLINE_KINDS), base: day, title: rules.optText(200), add: z.boolean() });
