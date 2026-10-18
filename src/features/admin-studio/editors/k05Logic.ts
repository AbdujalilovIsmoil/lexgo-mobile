import type { Dict } from "@/shared/lib/json";
import type { Errors } from "../form/types";
import { recList, str, strList } from "../form/values";
import { fieldNames, fieldRowsOf, validateFieldRows } from "./rowsLogic";

export const OPERATORS = ["not_empty", "empty", "equals", "not_equals", "contains"];
export const NEEDS_VALUE = ["equals", "not_equals", "contains"];

export const sectionsOf = (v: unknown): Dict[] => recList(v).map((s) => ({ ...s, title: str(s.title ?? s.name), fields: fieldRowsOf(s.fields) }));

export function rulesOf(v: unknown): Dict[] {
  return recList(v).map((r) => {
    const operator = str(r.operator) || "not_empty";
    const out: Dict = { ...r, field: str(r.field), operator, show_fields: strList(r.show_fields) };
    if (NEEDS_VALUE.includes(operator)) out.value = r.value == null ? "" : str(r.value);
    else delete out.value;
    return out;
  });
}

export const allFieldNames = (sections: Dict[]): string[] => [...new Set(sections.flatMap((s) => fieldNames(recList(s.fields))))];

export function validateK05(payload: Dict): Errors {
  const out: Errors = {};
  const sections = sectionsOf(payload.sections);
  if (!sections.length) out.sections = "@minOne";
  const seen = new Map<string, string>();
  sections.forEach((s, i) => {
    if (!str(s.title).trim()) out[`sections.${i}.title`] = "@required";
    const rows = recList(s.fields);
    if (!rows.length) out[`sections.${i}.fields`] = "@minOne";
    validateFieldRows(rows, `sections.${i}.fields`, seen, out);
  });
  rulesOf(payload.conditional_rules).forEach((r, i) => {
    const p = `conditional_rules.${i}`;
    if (!str(r.field)) out[`${p}.field`] = "@required";
    else if (!seen.has(str(r.field))) out[`${p}.field`] = "@rule";
    if (NEEDS_VALUE.includes(str(r.operator)) && !str(r.value).trim()) out[`${p}.value`] = "@required";
    const show = strList(r.show_fields);
    if (!show.length) out[`${p}.show_fields`] = "@required";
    else if (show.some((n) => !seen.has(n))) out[`${p}.show_fields`] = "@rule";
  });
  return out;
}
