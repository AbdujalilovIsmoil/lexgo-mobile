import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Closing summary: optional, sent as typed (max 2000).
export const summarySchema = z.object({ summary: z.string().max(2000, rules.m("max", 2000)) });
