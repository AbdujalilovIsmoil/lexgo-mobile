import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import type { DocField } from "../model/types";

const num = (v: unknown): number | undefined => {
  const n = typeof v === "string" && v.trim() === "" ? NaN : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function optionsOf(d: Dict): string[] {
  const raw = asArr(d.options ?? d.choices ?? d.values);
  return raw.map((o) => asStr(asDict(o).value ?? asDict(o).label) || asStr(o)).filter(Boolean);
}

// One field exactly as the backend describes it. Validation hints may sit on the
// field or under `validation`; all are optional.
export function normField(v: unknown, fallbackOrder = 0): DocField {
  const d = asDict(v);
  const val = asDict(d.validation);
  const pick = (...keys: string[]) => keys.map((k) => val[k] ?? d[k]).find((x) => x !== undefined && x !== null);
  const key = asStr(d.key) || asStr(d.name);
  return {
    key,
    label: asStr(d.label) || key,
    type: asStr(d.type ?? d.field_type, "text").toLowerCase(),
    required: Boolean(d.required),
    placeholder: asStr(d.placeholder ?? d.example) || undefined,
    hint: asStr(d.hint ?? d.help ?? d.tooltip) || undefined,
    options: optionsOf(d),
    pattern: asStr(pick("pattern", "regex")) || undefined,
    min: num(pick("min", "minimum")),
    max: num(pick("max", "maximum")),
    minLength: num(pick("min_length", "minLength")),
    maxLength: num(pick("max_length", "maxLength")),
    order: asNum(d.order ?? d.sort_order ?? d.field_order, fallbackOrder),
    source: asStr(d.source) || undefined,
  };
}
