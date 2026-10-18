import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { catValue, versionProblem } from "@/entities/admin-aireg";

export const UPLOAD_EMPTY = { title: "", choice: "support", custom: "", version: "1.0" };

// Reglament upload: a title, a category (a preset or a typed name) and a version that is well formed and above `current`.
// A version problem is reported as "format" | "low"; the sheet turns it into a sentence (the "low" one names `current`).
export const uploadSchema = (current: string) => z.object({
  title: rules.text(1, 200), choice: z.string(), custom: z.string(),
  version: z.string().superRefine((v, ctx) => {
    const p = versionProblem(v.trim(), current);
    if (p) ctx.addIssue({ code: "custom", message: p });
  }),
}).superRefine((v, ctx) => {
  if (!catValue(v.choice, v.custom)) ctx.addIssue({ code: "custom", path: ["custom"], message: rules.m("required") });
});
