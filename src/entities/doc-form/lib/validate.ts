import { normUzPhone } from "@/shared/lib/phone";
import type { DocField, DocSection } from "../model/types";
import { parseDoc } from "./dateParts";
import { isFilled, wireValue } from "./values";

export type FieldError = "required" | "email" | "phone" | "date" | "pattern" | "min" | "max" | "short" | "long";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The backend's own rules only: required, plus the type's natural format and any
// pattern / range / length it sent. Empty optional fields are always fine.
export function validateField(f: DocField, raw: string | undefined): FieldError | "" {
  if (!isFilled(f, raw)) return f.required ? "required" : "";
  const v = wireValue(f, raw);
  if (f.type === "email" && !EMAIL.test(v)) return "email";
  if (f.type === "date" && !parseDoc(v)) return "date";
  if ((f.type === "phone" || f.type === "tel") && !normUzPhone(v)) return "phone";
  if (f.pattern) {
    try {
      if (!new RegExp(f.pattern).test(v)) return "pattern";
    } catch {
      /* an unusable pattern is ignored */
    }
  }
  if (f.minLength != null && v.length < f.minLength) return "short";
  if (f.maxLength != null && v.length > f.maxLength) return "long";
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  if (f.type === "number" && Number.isFinite(n)) {
    if (f.min != null && n < f.min) return "min";
    if (f.max != null && n > f.max) return "max";
  }
  return "";
}

export function sectionErrors(s: DocSection, answers: Record<string, string>): Record<string, FieldError> {
  const out: Record<string, FieldError> = {};
  for (const f of s.fields) {
    const e = validateField(f, answers[f.key]);
    if (e) out[f.key] = e;
  }
  return out;
}

export const sectionFilled = (s: DocSection, a: Record<string, string>): number => s.fields.filter((f) => isFilled(f, a[f.key])).length;
