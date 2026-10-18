export type DocTemplate = { id: string; name: string; category: string; language: string; description: string; fields: number; sections: number; price: number; updatedAt: string; sourceFile: string };

// The catalogue's four branches (the server filters by `category`, nothing else).
export const TEMPLATE_CATEGORIES = ["legal-doc-civil", "legal-doc-economic", "legal-doc-administrative", "legal-doc-criminal"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

// i18n key of a category's short name ("Fuqarolik", …); unknown ones fall back to the raw slug.
export const categoryKey = (c: string): string => (c.startsWith("legal-doc-") ? `tpl.cat.${c.slice("legal-doc-".length)}` : "");

// Case-insensitive match on name, description and category; every word of the query must be found (any order).
export const matchTemplates = (rows: DocTemplate[], q: string): DocTemplate[] => {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return rows;
  return rows.filter((r) => {
    const hay = `${r.name} ${r.description} ${r.category}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
};
