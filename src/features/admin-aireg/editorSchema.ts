import { z } from "zod";
import { catValue, versionProblem, type RStatus } from "@/entities/admin-aireg";

// Reglament editor: title, category, version (above `current`) and the text are required.
// The messages are existing i18n keys; a version problem is "format" | "low" (the editor names `current` in the "low" one).
export const editorSchema = (current: string) => z.object({
  target: z.string(), title: z.string().trim().min(1, "admAiRegB.errTitle").max(200), choice: z.string(), custom: z.string(),
  version: z.string().superRefine((v, ctx) => {
    const p = versionProblem(v.trim(), current);
    if (p) ctx.addIssue({ code: "custom", message: p });
  }),
  status: z.custom<RStatus>(), content: z.string().trim().min(1, "admAiRegB.errContent"),
}).superRefine((v, ctx) => {
  if (!catValue(v.choice, v.custom)) ctx.addIssue({ code: "custom", path: ["custom"], message: "admAiRegB.errCategory" });
});
