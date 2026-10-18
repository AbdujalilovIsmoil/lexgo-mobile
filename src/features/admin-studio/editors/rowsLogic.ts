import type { Dict } from "@/shared/lib/json";
import type { Errors } from "../form/types";
import { SNAKE_RE, recList, rec, str, strList } from "../form/values";

export const FIELD_TYPES = ["text", "textarea", "number", "date", "select", "checkbox", "file"];

// A questionnaire field of K05 / K06: key, label, type, required, options (select only).
export function normFieldRow(v: unknown): Dict {
  const o = rec(v);
  const type = str(o.type).trim().toLowerCase() || "text";
  const out: Dict = { ...o, name: str(o.name ?? o.key).trim(), label: str(o.label ?? o.title), type, required: o.required === true };
  if (type === "select") out.options = strList(o.options);
  else delete out.options;
  return out;
}

export const fieldRowsOf = (v: unknown): Dict[] => recList(v).map(normFieldRow);
export const fieldNames = (rows: Dict[]): string[] => rows.map((r) => str(r.name).trim()).filter(Boolean);

// Same rules as validateFieldRows on the web: key required, snake_case, unique across the whole form.
export function validateFieldRows(rows: Dict[], prefix: string, seen: Map<string, string>, out: Errors): void {
  rows.forEach((r, i) => {
    const p = `${prefix}.${i}`;
    const name = str(r.name).trim();
    if (!name) out[`${p}.name`] = "@required";
    else if (!SNAKE_RE.test(name)) out[`${p}.name`] = "@snake";
    else if (seen.has(name)) {
      out[`${p}.name`] = "@duplicate";
      const firstAt = seen.get(name) ?? "";
      if (firstAt && !out[`${firstAt}.name`]) out[`${firstAt}.name`] = "@duplicate";
    } else seen.set(name, p);
    if (!str(r.label).trim()) out[`${p}.label`] = "@required";
    if (str(r.type) === "select" && strList(r.options).length === 0) out[`${p}.options`] = "@options";
  });
}
