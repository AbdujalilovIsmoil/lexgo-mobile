import { z } from "zod";
import { STAGES } from "@/entities/pro-tasks";
import * as rules from "@/shared/form/rules";
import { isDay } from "@/shared/lib/pro/dates";

// A task: a title, an optional real due day, free description and the checklist items (never empty text).
export const taskSchema = z.object({
  title: rules.text(1, 200),
  priority: z.string(),
  due: z.string().refine((v) => !v || isDay(v), rules.m("date")),
  caseId: z.string(),
  description: rules.optText(2000),
  checklist: z.array(z.object({ text: z.string().min(1), done: z.boolean() })),
  stage: z.enum(STAGES),
  blocked: z.boolean(),
});
