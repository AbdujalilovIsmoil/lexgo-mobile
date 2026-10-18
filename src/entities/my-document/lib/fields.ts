import type { DocField } from "../model/docTypes";

export type FieldKind = "text" | "multiline" | "number" | "date" | "phone" | "email";

const has = (name: string, words: string[]) => words.some((w) => new RegExp(`(^|_)${w}(_|$)`).test(name));

// The backend types most fields; an untyped one is guessed from its machine name.
export function fieldKind(f: DocField): FieldKind {
  const t = f.type;
  if (["textarea", "multiline", "long"].includes(t)) return "multiline";
  if (["number", "int", "integer", "money", "amount"].includes(t)) return "number";
  if (t === "date") return "date";
  if (["phone", "tel"].includes(t)) return "phone";
  if (t === "email") return "email";
  if (t) return "text";
  const n = f.name.toLowerCase();
  if (has(n, ["date", "sana", "dob", "birth"])) return "date";
  if (has(n, ["phone", "tel", "telefon"])) return "phone";
  return has(n, ["email", "mail"]) ? "email" : "text";
}

// Court documents write dates as 21.09.2026; the date field itself speaks YYYY-MM-DD.
export const docDate = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso.trim();
};
export const isoDate = (v: string): string => {
  const m = /^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/.exec(v.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : v.trim();
};

const groupInt = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// The canonical value that goes to PUT …/answers (same rules as the web form).
export function normalizeAnswer(kind: FieldKind, raw: string): string {
  const v = raw.trim();
  if (kind === "date") return docDate(v);
  if (kind === "multiline") return raw.replace(/[ \t]+$/gm, "").trim();
  if (kind !== "number") return v;
  const m = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/.exec(v.replace(/[\s ]/g, ""));
  if (!m) return v;
  return `${m[1]}${groupInt(m[2])}${m[3] && !/^0+$/.test(m[3]) ? `.${m[3]}` : ""}`;
}

export const sanitizeInput = (kind: FieldKind, raw: string): string => (kind === "number" ? raw.replace(/[^\d.,\s-]/g, "") : raw);

export const answerText = (answers: Record<string, unknown>, name: string): string => {
  const v = answers[name];
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
};

export const sortFields = (fields: DocField[]): DocField[] => fields.map((f, i) => ({ f, i })).sort((a, b) => a.f.order - b.f.order || a.i - b.i).map(({ f }) => f);

export type FieldGroup = { key: string; title: string; fields: DocField[] };

// Fields under the backend's own section titles, sections in their given order.
export function groupFields(fields: DocField[]): FieldGroup[] {
  const map = new Map<string, FieldGroup & { order: number }>();
  for (const f of fields) {
    const g = map.get(f.section) ?? { key: f.section, title: f.section, fields: [], order: f.sectionOrder };
    g.fields.push(f);
    map.set(f.section, g);
  }
  return [...map.values()].sort((a, b) => a.order - b.order);
}

export const missingRequired = (fields: DocField[], values: Record<string, string>): DocField[] =>
  fields.filter((f) => f.required && normalizeAnswer(fieldKind(f), values[f.name] ?? "") === "");
