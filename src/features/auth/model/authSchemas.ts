import { z } from "zod";
import * as rules from "@/shared/form/rules";
import { REGIONS, REGISTER_ROLES } from "./registerRoles";

// Messages are i18n keys (see shared/form/rules.ts); the auth ones reuse the wording the screens always had.
const name = (key: string) => z.string().trim().min(2, key).max(80, rules.m("max", 80)).regex(/^[\p{L}\p{M}'’ʻ`\- .]+$/u, rules.m("nameChars"));

export const loginSchema = z.object({ phone: rules.phone, password: z.string().min(1, "auth.required") });
export const forgotSchema = z.object({ phone: rules.phone });

// Sign-up: names, region, number, an 8+ character password, the optional referral code, and the documents ticked.
export const registerSchema = z.object({
  role: z.enum(REGISTER_ROLES),
  firstName: name("au1.firstNameReq"),
  lastName: name("au1.lastNameReq"),
  middleName: z.string().trim().max(80, rules.m("max", 80)),
  region: z.enum(REGIONS, "au1.regionReq"),
  phone: rules.phone,
  password: z.string().min(8, "auth.passwordHint").max(128, rules.m("max", 128)),
  code: z.string().trim().max(32),
  agreed: z.boolean().refine((v) => v, "au1.agreeReq"),
});
export type RegisterValues = z.infer<typeof registerSchema>;
