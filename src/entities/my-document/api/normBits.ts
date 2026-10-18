import { asArr, asDict, asNum, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { CtorAction, DocGate, DocMode, DocRating } from "../model/types";
import type { DocField } from "../model/docTypes";

export const modeOf = (v: unknown): DocMode => (asStr(v) === "ai" ? "ai" : asStr(v) === "lawyer" ? "lawyer" : "manual");

// The rating window is the backend's: `available && !submitted` is the whole test (TZ 27).
// The nested object (service-flow) and the flat rating_* keys (detail) mean the same thing.
export function normRating(nested: unknown, flat: Dict = {}): DocRating {
  const n = asDict(nested);
  const has = ["deadline_at", "available", "submitted"].some((k) => n[k] !== undefined);
  const src: Dict = has ? n : { deadline_at: flat.rating_deadline_at, available: flat.rating_available, submitted: flat.rating_submitted, remaining_seconds: flat.rating_remaining_seconds, closed_reason: flat.rating_closed_reason, value: flat.rating };
  const rec = asDict(src.value);
  return {
    available: src.available === true,
    submitted: src.submitted === true,
    value: typeof src.value === "number" ? src.value : asNum(rec.rating),
    comment: asStr(rec.comment),
    deadlineAt: asStr(src.deadline_at),
    remainingSeconds: asNum(src.remaining_seconds),
    closedReason: asStr(src.closed_reason),
  };
}

export function normGate(v: unknown): DocGate | null {
  const d = asDict(v);
  if (!d.status && !d.amount && !d.payment_id) return null;
  return { status: asStr(d.status), amount: uzs(d, "amount"), currency: asStr(d.currency, "UZS"), pageCount: asNum(d.page_count), includedPages: asNum(d.included_pages), extraPages: asNum(d.extra_pages), telegramSent: d.telegram_sent === true };
}

export function normCtor(v: unknown): CtorAction | null {
  const d = asDict(v);
  if (!("available" in d)) return null;
  return { available: d.available === true, promptRequired: d.prompt_required === true, title: asStr(d.title), message: asStr(d.message) };
}

// Backend placeholders are the label in braces ("{Label}") — noise inside an input.
const cleanHint = (ph: string, label: string): string => {
  const s = ph.replace(/^\{+|\}+$/g, "").trim();
  return s === label.trim() ? "" : s;
};

export function normField(v: unknown, i: number): DocField {
  const d = asDict(v);
  const name = asStr(d.name) || asStr(d.key);
  const label = asStr(d.label) || name;
  const opts = asArr(d.options ?? d.choices).map((o) => asStr(asDict(o).value ?? asDict(o).label) || asStr(o)).filter(Boolean);
  return {
    name,
    label,
    type: asStr(d.type ?? d.field_type).toLowerCase(),
    required: d.required === true,
    placeholder: cleanHint(asStr(d.placeholder), label),
    options: opts,
    section: asStr(d.section_title ?? d.section_id),
    sectionOrder: asNum(d.section_order),
    order: asNum(d.order ?? d.sort_order ?? d.field_order, i),
  };
}
