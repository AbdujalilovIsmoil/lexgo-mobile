import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { isDay } from "@/shared/lib/pro/dates";

// A case: a title of at least 2 characters, an optional real deadline day, the rest is free text.
export const caseSchema = z.object({
  title: rules.text(2, 200),
  type: rules.optText(100),
  status: z.string(),
  stage: rules.optText(200),
  next: rules.optText(500),
  deadline: z.string().refine((v) => !v || isDay(v), rules.m("date")),
  desc: rules.optText(4000),
});
