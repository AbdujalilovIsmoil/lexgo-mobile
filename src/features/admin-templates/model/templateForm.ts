import type { Template, TemplateInput } from "@/entities/admin-templates";

export type FormVals = { title: string; slug: string; category: string; language: string; description: string; template_text: string; price: string; is_active: boolean };

export const EMPTY: FormVals = { title: "", slug: "", category: "", language: "uz", description: "", template_text: "", price: "", is_active: true };

export const seedFrom = (d: Template): FormVals => ({
  title: d.name, slug: d.slug, category: d.category, language: d.language, description: d.description, template_text: d.templateText,
  price: d.price ? String(Math.round(d.price)) : "", is_active: d.isActive,
});

export const toBody = (v: FormVals): TemplateInput => ({
  slug: v.slug.trim(), title: v.title.trim(), category: v.category.trim(), language: v.language.trim(), description: v.description,
  template_text: v.template_text, price: parseInt(v.price, 10) || 0, is_active: v.is_active,
});
