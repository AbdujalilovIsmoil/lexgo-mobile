import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The optional note of a cancel / complete confirmation.
export const noteSchema = z.object({ note: z.string().max(500, rules.m("max", 500)) });
