import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { cleanTitle } from "../lib/title";
import type { Preview, Template, TemplateField } from "../model/types";

export function normTemplate(v: unknown): Template {
  const d = asDict(v);
  const raw = asStr(d.title ?? d.name);
  return {
    id: asStr(d.id),
    name: cleanTitle(raw) || raw,
    slug: asStr(d.slug),
    category: asStr(d.category),
    language: asStr(d.language),
    description: asStr(d.description).replace(/^[_\s]+/, "").trim(),
    price: uzs(d, "price"),
    visibility: asStr(d.visibility, "client"),
    isActive: d.is_active !== false,
    templateText: asStr(d.template_text ?? d.body ?? d.content),
    fieldsCount: asNum(d.fields_count, asArr(d.fields).length),
  };
}

const normField = (f: unknown): TemplateField => {
  const r = asDict(f);
  return { key: asStr(r.key ?? r.name), label: asStr(r.label ?? r.key), type: asStr(r.type, "text"), required: r.required !== false };
};

export const normPreview = (v: unknown): Preview => {
  const d = asDict(v);
  return { fields: asArr(d.fields).map(normField), previewText: asStr(d.preview_text ?? d.preview) };
};
