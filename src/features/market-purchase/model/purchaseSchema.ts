import { z } from "zod";
import * as rules from "@/shared/form/rules";

export const NOTE_MAX = 1000;
// Purchase request: what happened and when it suits are optional, both sent as typed.
export const purchaseSchema = z.object({
  note: z.string().max(NOTE_MAX, rules.m("max", NOTE_MAX)),
  time: z.string().max(120, rules.m("max", 120)),
});
