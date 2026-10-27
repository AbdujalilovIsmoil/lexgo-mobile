import { z } from "zod";
import * as rules from "@/shared/form/rules";

const note = z.string().max(500, rules.m("max", 500));

// Decline: a reason, and a note that is required when the reason is "other".
export const declineSchema = z
  .object({ reason: z.string().min(1, rules.m("pick")), note })
  .refine((v) => v.reason !== "other" || !!v.note.trim(), { path: ["note"], message: "sl9.noteRequired" });
