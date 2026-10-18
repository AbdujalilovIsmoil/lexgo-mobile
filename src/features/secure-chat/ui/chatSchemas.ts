import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Closing summary: optional, sent as typed (max 2000).
export const summarySchema = z.object({ summary: z.string().max(2000, rules.m("max", 2000)) });
// Reveal request: a reason of at least 5 characters (audited).
export const revealAskSchema = z.object({ text: rules.text(5, 300) });
// Reveal approval: the request id, sent as typed (max 64).
export const revealApproveSchema = z.object({ text: z.string().max(64, rules.m("max", 64)) });
