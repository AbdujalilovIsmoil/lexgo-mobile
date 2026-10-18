import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { isUzPhone } from "@/shared/lib/phone";

// New organization: a name of 2-255 characters, a phone that is optional but complete when typed.
export const orgSchema = z.object({
  name: z.string().trim().min(2, "og1.errName").max(255, rules.m("max", 255)),
  phone: z.string().refine((v) => !v.trim() || isUzPhone(v), "og1.errPhone"),
  inn: rules.optText(20),
  region: z.string(),
  address: rules.optText(500),
});
