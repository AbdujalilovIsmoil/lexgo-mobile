import { z } from "zod";
import * as rules from "@/shared/form/rules";
import type { ImportMode } from "./pickImportFile";

export const digitsOnly = (x: string) => x.replace(/\D/g, "");
export const slugify = (x: string) => x.toLowerCase().replace(/[^a-z0-9-]/g, "-");
const longText = (max: number) => z.string().max(max, rules.m("max", max));

// Template: title, slug and the body are required; the body is sent as typed (only emptiness is checked on the trimmed text).
export const templateSchema = z.object({
  title: rules.text(1, 200), slug: rules.slug, category: rules.optText(100), language: rules.optText(20), description: longText(4000),
  template_text: longText(500000).refine((v) => v.trim().length > 0, rules.m("required")), price: rules.optIntText(), is_active: z.boolean(),
});

// DOCX import: title and slug are asked (and required) only in "docx" mode; a ZIP takes them from every file name.
export const importSchema = (mode: ImportMode) => z.object({
  title: mode === "docx" ? rules.text(1, 200) : z.string(), slug: mode === "docx" ? rules.slug : z.string(), price: rules.optIntText(),
});
