import type { StudioField } from "@/entities/admin-studio";
import type { Dict } from "@/shared/lib/json";
import type { Errors } from "./types";
import { list, rec } from "./values";

// Same meaning as isBlank of the entity (kept local so this pure module stays light): empty text / list / object.
const isBlank = (v: unknown): boolean => v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v as object).length);

// A new row of a list of objects, seeded with the defaults the schema gives (e.g. kind = mandatory, quantity = 1).
export function defaultRow(props: StudioField[]): Dict {
  const row: Dict = {};
  for (const p of props) {
    if (p.def !== undefined && p.def !== null) row[p.key] = p.def;
    else if (p.type === "boolean") row[p.key] = false;
    else if (p.type === "list") row[p.key] = [];
  }
  return row;
}

// Schema-driven check of nested values: required, numeric `min`, list `min_items`. Paths are "sections.0.options.1.value".
export function checkFields(fields: StudioField[], payload: Dict, prefix: string, out: Errors): Errors {
  for (const f of fields) {
    if (f.managed) continue;
    const v = payload[f.key];
    const path = prefix ? `${prefix}.${f.key}` : f.key;
    if (f.required && isBlank(v)) out[path] = "@required";
    else if ((f.type === "number" || f.type === "money") && !isBlank(v)) {
      const n = Number(v);
      if (!Number.isFinite(n)) out[path] = "@number";
      else if (f.min !== undefined && n < f.min) out[path] = f.min === 0 ? "@negative" : "@min";
    }
    if (f.type === "list" && f.minItems && list(v).length < f.minItems) out[path] = f.minItems === 1 ? "@minOne" : "@minItems";
    if (f.type === "list" && f.item?.props) list(v).forEach((row, i) => checkFields(f.item?.props ?? [], rec(row), `${path}.${i}`, out));
    if (f.type === "object" && f.props) checkFields(f.props, rec(v), path, out);
  }
  return out;
}
