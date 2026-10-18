import { z } from "zod";
import * as rules from "@/shared/form/rules";

// Lower-case latin slug typed by an admin: anything else becomes a dash.
export const slugify = (x: string) => x.toLowerCase().replace(/[^a-z0-9-]/g, "-");
export const digitsOnly = (x: string) => x.replace(/\D/g, "");
const longText = (max: number) => z.string().max(max, rules.m("max", max));

// New service: category, title, slug are required; price and delivery time are optional whole numbers (empty = 0).
export const serviceCreateSchema = z.object({
  category_id: rules.pick, title: rules.text(1, 200), slug: rules.slug, description: longText(4000),
  base_price: rules.optIntText(), delivery_minutes: rules.optIntText(), is_active: z.boolean(),
});
export const SERVICE_EMPTY = { category_id: "", title: "", slug: "", description: "", base_price: "", delivery_minutes: "", is_active: true };

// Category: a title always; the slug only when creating (a rename keeps it).
export const categorySchema = (editing: boolean) => z.object({
  title: rules.text(1, 200), slug: editing ? z.string() : rules.slug, description: longText(4000),
});

// Edit form of a service: title required, numbers digits only, catalogue metadata free short text.
const meta = rules.optText(500);
export const serviceEditSchema = z.object({
  title: rules.text(1, 200), category_id: z.string(), description: longText(4000), base_price: rules.optIntText(), currency: z.string(), delivery_minutes: rules.optIntText(), is_active: z.boolean(),
  title_uz_latn: meta, title_uz_cyrl: meta, title_ru: meta, executor_type: meta, advokat_required: z.boolean(),
  pricing_tier: meta, standard_price: rules.optIntText(), sla_code: meta, refund_code: meta, ai_category: meta,
});
