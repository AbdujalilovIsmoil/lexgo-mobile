import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { versionOk } from "@/entities/admin-studio";

// An optional note under a confirm sheet.
export const noteSchema = z.object({ note: rules.optText(1000) });
// "Save with a note": an optional summary and an optional version like 1.2.3.
export const saveMetaSchema = z.object({
  summary: rules.optText(300), version: z.string().refine(versionOk, "admStudioB.save.versionBad"),
});
