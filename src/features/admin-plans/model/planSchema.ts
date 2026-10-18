import { z } from "zod";
import * as rules from "@/shared/form/rules";
import type { BillingPeriod } from "@/entities/admin-plans";

export const digitsOnly = (x: string) => x.replace(/\D/g, "");
// Gift terms: months separated by commas or new lines ("3, 6, 12"); empty is fine.
const months = z.string().refine((v) => v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).every((s) => /^\d+$/.test(s)), rules.m("digits"));

// Tariff form: title and slug are required, numbers are whole, texts are free.
export const planSchema = z.object({
  title: rules.text(1, 200), slug: rules.slug, audience: z.enum(["client", "yurist", "advokat", "seller"]), targetRoles: z.array(z.string()),
  autoChargeProvider: z.string(), billingType: rules.optText(100), sortOrder: rules.optIntText(), giftDurations: months,
  period: z.custom<BillingPeriod>(), price: rules.optIntText(), description: z.string().max(4000, rules.m("max", 4000)),
  benefits: z.string().max(8000, rules.m("max", 8000)), isGiftable: z.boolean(), isActive: z.boolean(),
});
