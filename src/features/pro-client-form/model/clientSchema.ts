import { z } from "zod";
import * as rules from "@/shared/form/rules";

// PINFL is optional, but when given it is exactly 14 digits.
const pinfl = z.string().refine((v) => v === "" || /^\d{14}$/.test(v), rules.m("digits"));

// Own-base client: a name (2+ characters) and optional contact data / lists.
export const clientSchema = z.object({
  name: rules.text(2, 120),
  phone: rules.optPhone,
  pinfl,
  company: rules.optText(160),
  opponents: rules.optText(500),
  reps: rules.optText(500),
  notes: rules.optText(2000),
});

// Stand-alone conflict check: at least one of the four inputs must be filled.
export const conflictSchema = z
  .object({ phone: rules.optPhone, pinfl, opponent: rules.optText(120), reps: rules.optText(500) })
  .refine((v) => !!(v.phone.replace(/\D/g, "").length > 3 || v.pinfl || v.opponent || v.reps), { path: ["phone"], message: rules.m("required") });

