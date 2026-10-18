import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Text validation for the call-centre sheets; choices (status, advocate, reason pick) are plain strings.
export const statusSchema = z.object({ to: z.string(), note: rules.optText(500) });
export const ccLostSchema = z.object({ reason: z.string(), note: rules.optText(2000) });
export const cancelSchema = z.object({ reason: rules.text(3, 500) });
export const completeSchema = z.object({ summary: rules.text(5, 4000), next: rules.optText(500) });
export const ccTransferSchema = z.object({ pick: z.string(), reason: rules.optText(500) });
export const logCallSchema = z.object({
  direction: z.string(), phone: z.string().trim().min(1, "admCcC.phoneRequired").max(40, rules.m("max", 40)), topic: rules.optText(200),
  result: z.string(), minutes: rules.optIntText(0, 100000), next: rules.optText(300), summary: rules.optText(2000),
});
export const resolveSchema = z.object({ note: rules.text(1, 2000) });
export const groupSchema = z.object({ date: z.string(), time: z.string(), note: rules.optText(1000) });
