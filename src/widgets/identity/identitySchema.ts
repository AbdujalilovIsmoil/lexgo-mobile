import { z } from "zod";
import * as rules from "@/shared/form/rules";

// The verification code of the identity provider (digits only).
export const identitySchema = z.object({ code: z.string().trim().min(1, rules.m("required")).regex(/^\d{4,10}$/, rules.m("code")) });
