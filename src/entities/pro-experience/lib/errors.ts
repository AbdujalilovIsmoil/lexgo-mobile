import { ApiError } from "@/shared/api/errors";
import { asDict, asStr } from "@/shared/lib/json";
import { strs } from "../api/norm";

// The inputs of the form a server error can point at.
export type ExpSlot = "category" | "subcategory" | "workplace" | "position" | "started" | "ended" | "description" | "stages" | "results" | "evidence";
export type ExpServerError = { code: string; slots: ExpSlot[]; conflictId: string; values: string[]; allowed: string[] };

const BY_FIELD: Record<string, ExpSlot> = {
  category_id: "category", subcategory_id: "subcategory", workplace: "workplace", position: "position", started_at: "started", ended_at: "ended",
  is_current: "ended", description: "description", stages: "stages", results: "results", evidence_ids: "evidence", evidence: "evidence",
};
// A code that arrives without its `field` still belongs to an input.
const BY_CODE: Record<string, ExpSlot> = {
  experience_dates_invalid: "ended", experience_future_date: "started", experience_dates_overlap: "started", experience_category_invalid: "category",
  experience_subcategory_invalid: "subcategory", experience_stage_invalid: "stages", experience_result_invalid: "results",
};

// §3.12: an `experience_*` code names its input (`field`, or `fields[]` for experience_fields_required), the overlapping entry
// (`conflicting_experience_id`) and the refused stage / result `values` with the `allowed` ones; a FastAPI 422 names inputs by `loc`.
// null = not about the form (offline, 5xx …).
export function experienceErrorOf(e: unknown): ExpServerError | null {
  if (!(e instanceof ApiError)) return null;
  const d = asDict(e.data.detail);
  const raw = asStr(d.code) || e.code || "";
  const code = raw.startsWith("experience_") ? raw : "";
  const named = [asStr(d.field), ...strs(d.fields), ...Object.keys(e.fieldErrors)].map((f) => BY_FIELD[f]).filter((s): s is ExpSlot => !!s);
  const slots = [...new Set(named.length ? named : BY_CODE[code] ? [BY_CODE[code]] : [])];
  if (!code && !slots.length) return null;
  return { code, slots, conflictId: asStr(d.conflicting_experience_id), values: strs(d.values), allowed: strs(d.allowed) };
}
