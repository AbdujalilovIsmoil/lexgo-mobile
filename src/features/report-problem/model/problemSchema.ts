import { z } from "zod";
import * as rules from "@/shared/form/rules";

// A problem report: at least 3 characters of text (sent exactly as typed), at most 4000.
export const problemSchema = z.object({
  message: z.string().min(1, rules.m("required")).max(4000, rules.m("max", 4000)).refine((v) => !v || v.trim().length >= 3, rules.m("min", 3)),
});
