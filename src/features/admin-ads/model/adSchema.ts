import { z } from "zod";
import * as rules from "@/shared/form/rules";
import type { Ad } from "@/entities/admin-ads";

// Ad product: a title is required, the price is a whole number (empty = 0), the status is free text (edit only).
export const adSchema = z.object({
  title: rules.text(1, 200), description: z.string().max(4000, rules.m("max", 4000)), price: rules.optIntText(), status: rules.optText(50),
});
export const adDefaults = (a: Ad | null) => ({ title: a?.title ?? "", description: a?.description ?? "", price: a?.price ? String(Math.round(a.price)) : "", status: a?.status ?? "active" });
