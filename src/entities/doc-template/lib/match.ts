import { fold } from "./search";

export type DocTemplate = { id: string; name: string; category: string; language: string; description: string; fields: number; sections: number; price: number; updatedAt: string; sourceFile: string; hasSource: boolean };

// The catalogue's four branches (the server filters by `category`, nothing else).
export const TEMPLATE_CATEGORIES = ["legal-doc-civil", "legal-doc-economic", "legal-doc-administrative", "legal-doc-criminal"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

// i18n key of a category's short name ("Fuqarolik", …); unknown ones fall back to the raw slug.
export const categoryKey = (c: string): string => (c.startsWith("legal-doc-") ? `tpl.cat.${c.slice("legal-doc-".length)}` : "");

// The folded searchable text of a row, made once per row (the catalogue holds ~1000 of them and a search runs over all).
const hays = new WeakMap<DocTemplate, string>();
const hayOf = (r: DocTemplate): string => {
  let h = hays.get(r);
  if (h === undefined) { h = fold(`${r.name} ${r.description} ${r.category}`); hays.set(r, h); }
  return h;
};

// Matches on name, description and category with every word of the query found (any order). Cyrillic and Latin spellings match each other.
export const matchTemplates = (rows: DocTemplate[], q: string): DocTemplate[] => {
  const words = fold(q).split(" ").filter(Boolean);
  if (!words.length) return rows;
  return rows.filter((r) => { const hay = hayOf(r); return words.every((w) => hay.includes(w)); });
};
