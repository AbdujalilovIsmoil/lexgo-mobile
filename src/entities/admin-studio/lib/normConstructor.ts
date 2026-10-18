import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { StudioConstructor } from "../model/types";
import { boolOf, first, strings } from "./norm";
import { normField } from "./normField";
import { normNav } from "./normNav";

export { refKey, normField } from "./normField";

export function normConstructor(raw: unknown): StudioConstructor {
  const r = asDict(raw);
  const schema = asDict(r.schema);
  const code = first(r.code, r.constructor_code, r.key);
  const fields = asArr(schema.fields).map(normField).filter((f) => f.key);
  const required = strings(schema.required ?? r.required_fields);
  return {
    code,
    title: first(r.title, r.name, code),
    category: first(r.category),
    description: first(r.description),
    runtime: first(r.runtime_target),
    approvalRequired: boolOf(r.approval_required) ?? code !== "K16",
    required,
    fieldCount: asNum(r.field_count, fields.length),
    fields,
    nav: normNav(r),
  };
}
