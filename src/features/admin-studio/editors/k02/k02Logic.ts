import type { Dict } from "@/shared/lib/json";
import type { Errors } from "../../form/types";
import { rec, recList, str, strList } from "../../form/values";

export const METHODS = ["checkbox", "comment", "image", "file"] as const;
export type Method = (typeof METHODS)[number];
export const PROOF = ["comment", "image", "file"] as const;
export const ADJUSTMENTS = ["fixed", "percent"] as const;

// "Name[2].field" and "name.2.field": the server and the local checks spell a row path differently.
export const rowErr = (errors: Errors, list: string, i: number, field: string): string => errors[`${list}[${i}].${field}`] ?? errors[`${list}.${i}.${field}`] ?? "";

export type Override = { adjustment_type: string; value: number | "" };
export const overrideOf = (v: unknown): Override => {
  const d = rec(v);
  const n = typeof d.value === "number" ? d.value : Number(d.value);
  return { adjustment_type: str(d.adjustment_type) || "fixed", value: d.value === undefined || d.value === null || d.value === "" || !Number.isFinite(n) ? "" : n };
};

// Removing a factor takes its override with it: an entry for a factor that is not selected is rejected by the server.
export function pruneOverrides(payload: Dict): Dict {
  const ids = new Set(strList(payload.price_factor_ids));
  const left = Object.fromEntries(Object.entries(rec(payload.price_factor_overrides)).filter(([id]) => ids.has(id)));
  return { ...payload, price_factor_overrides: left };
}

// A checklist row as the form edits it: `checkbox` is always there, proof flags only count for a chosen method.
export function normRow(row: Dict): Dict {
  const methods = [...new Set<string>(["checkbox", ...strList(row.verification_methods).filter((m) => (METHODS as readonly string[]).includes(m))])];
  return {
    ...row,
    title: str(row.title),
    description: str(row.description),
    required: row.required !== false,
    verification_methods: methods,
    comment_required: methods.includes("comment") && row.comment_required === true,
    image_required: methods.includes("image") && row.image_required === true,
    file_required: methods.includes("file") && row.file_required === true,
  };
}
export const newRow = (): Dict => normRow({ title: "", description: "", required: true });

export function validateK02(payload: Dict): Errors {
  const out: Errors = {};
  for (const [id, raw] of Object.entries(rec(payload.price_factor_overrides))) {
    const o = overrideOf(raw);
    const k = `price_factor_overrides.${id}.value`;
    if (o.value === "") out[k] = "@required";
    else if (o.value < 0) out[k] = "@nonneg";
    else if (o.adjustment_type === "percent" && o.value > 100) out[k] = "@max100";
  }
  recList(payload.completion_checklist).forEach((row, i) => {
    const methods = strList(row.verification_methods);
    if (!str(row.title).trim()) out[`completion_checklist.${i}.title`] = "@required";
    if (!methods.includes("checkbox")) out[`completion_checklist.${i}.verification_methods`] = "@checkbox";
    for (const m of PROOF) if (row[`${m}_required`] === true && !methods.includes(m)) out[`completion_checklist.${i}.${m}_required`] = "@methodOff";
  });
  recList(payload.inline_rules).forEach((r, i) => {
    if (!str(r.title).trim()) out[`inline_rules.${i}.title`] = "@required";
    if (!str(r.body).trim()) out[`inline_rules.${i}.body`] = "@required";
  });
  recList(payload.inline_guarantees).forEach((g, i) => {
    if (!str(g.title).trim()) out[`inline_guarantees.${i}.title`] = "@required";
    if (!str(g.description).trim()) out[`inline_guarantees.${i}.description`] = "@required";
  });
  return out;
}

// What the template fields show: the source only while a template is wanted, the catalogue pick only for a catalogue source.
export const showSource = (p: Dict): boolean => str(p.template_mode) !== "not_required";
export const showCatalog = (p: Dict): boolean => showSource(p) && ["catalog", "catalog_or_upload"].includes(str(p.template_source));

export const emptyK02 = (): Dict => ({
  is_active: false, negotiation_allowed: false, duration_calendar: "calendar", usage_steps: [], price_factor_ids: [], price_factor_overrides: {},
  completion_checklist: [], rule_ids: [], inline_rules: [], guarantee_ids: [], inline_guarantees: [], discovery_terms: [],
});
