import type { Dict } from "@/shared/lib/json";
import type { Errors } from "../form/types";
import { recList, slugify, str } from "../form/values";

export const ADJUSTMENTS = ["fixed", "percent"] as const;
export const TARGETS = ["service", "package"] as const;

export const newSection = (n: number): Dict => ({ id: "", title: "", description: "", sort_order: n, options: [] });
export const newOption = (n: number): Dict => ({ id: "", label: "", description: "", adjustment_type: "fixed", sort_order: n });
// "Urgent execution" → "urgent-execution" (ids of the web examples use hyphens).
export const optionId = (label: string): string => slugify(label).replace(/_/g, "-");

const dupes = (ids: string[]): Set<string> => new Set(ids.filter((x, i) => x && ids.indexOf(x) !== i));

// Same rules the backend enforces: one target, unique ids, adjustment fixed|percent, value >= 0 (options only raise the price).
export function validateK29(payload: Dict): Errors {
  const out: Errors = {};
  const target = str(payload.target_type);
  if (!(TARGETS as readonly string[]).includes(target)) out.target_type = "@required";
  else if (!str(payload[`${target}_id`]).trim()) out[`${target}_id`] = "@required";
  const sections = recList(payload.sections);
  if (!sections.length) out.sections = "@minOne";
  const dupSec = dupes(sections.map((s) => str(s.id).trim()));
  const dupOpt = dupes(sections.flatMap((s) => recList(s.options).map((o) => str(o.id).trim())));
  sections.forEach((s, i) => {
    const p = `sections.${i}`;
    if (!str(s.id).trim()) out[`${p}.id`] = "@required";
    else if (dupSec.has(str(s.id).trim())) out[`${p}.id`] = "@duplicate";
    if (!str(s.title).trim()) out[`${p}.title`] = "@required";
    recList(s.options).forEach((o, j) => {
      const q = `${p}.options.${j}`;
      if (!str(o.id).trim()) out[`${q}.id`] = "@required";
      else if (dupOpt.has(str(o.id).trim())) out[`${q}.id`] = "@duplicate";
      if (!str(o.label).trim()) out[`${q}.label`] = "@required";
      if (!(ADJUSTMENTS as readonly string[]).includes(str(o.adjustment_type))) out[`${q}.adjustment_type`] = "@required";
      const v = o.value;
      if (v === undefined || v === null || v === "") out[`${q}.value`] = "@required";
      else if (!Number.isFinite(Number(v))) out[`${q}.value`] = "@number";
      else if (Number(v) < 0) out[`${q}.value`] = "@negative";
    });
  });
  return out;
}

// The target switch keeps only the id that belongs to it.
export const withTarget = (payload: Dict, target: string): Dict => {
  const next: Dict = { ...payload, target_type: target };
  delete next[target === "service" ? "package_id" : "service_id"];
  return next;
};
