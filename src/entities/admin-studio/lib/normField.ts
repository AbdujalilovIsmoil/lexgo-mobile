import { asDict, asNum } from "@/shared/lib/json";
import type { StudioField } from "../model/types";
import { boolOf, first, str, strings } from "./norm";

// "/studio/reference/services?x=1" → "services"
export const refKey = (src: string): string => src.split("?")[0].replace(/\/+$/, "").split("/").pop() ?? "";

const members = (v: unknown): StudioField[] | undefined => (Array.isArray(v) && v.length ? v.map(normField).filter((f) => f.key) : undefined);

// One schema entry. Lists carry `item` (a scalar or an object with `props`), objects carry `props`.
export function normField(v: unknown): StudioField {
  const r = asDict(v);
  const key = typeof v === "string" ? v : first(r.key, r.name);
  const min = asNum(r.min, NaN);
  const minItems = asNum(r.min_items, NaN);
  const ui = asDict(r.ui);
  const item = r.item_schema ? normField(r.item_schema) : undefined;
  return {
    key,
    label: first(r.label, r.title),
    type: first(r.type).toLowerCase() || "text",
    required: r.required === true,
    section: first(r.section),
    help: first(r.help_text, r.hint),
    options: strings(r.options),
    source: refKey(str(r.source)),
    min: Number.isFinite(min) ? min : undefined,
    minItems: Number.isFinite(minItems) ? minItems : undefined,
    item: item && (item.key || item.props) ? item : undefined,
    props: members(r.properties),
    managed: boolOf(r.context_managed) === true || ui.hidden === true || undefined,
    def: r.default ?? undefined,
  };
}
