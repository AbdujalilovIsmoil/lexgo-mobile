import { formatUzPhone } from "@/shared/lib/phone";
import type { DocField } from "../model/types";

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

// Court papers write dates as 21.09.2026 — the form keeps that form too; an ISO
// value (an older draft) is converted.
export const isoToDoc = (v: string): string => {
  const m = ISO.exec(v.trim());
  return m ? `${m[3]}.${m[2]}.${m[1]}` : v.trim();
};

const phoneValue = (v: string): string => (v.replace(/\D/g, "").replace(/^998/, "") ? formatUzPhone(v) : "");

// What the backend receives for one answer (empty string = not answered).
export function wireValue(f: DocField, raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  if (f.type === "date") return isoToDoc(v);
  if (f.type === "phone" || f.type === "tel") return phoneValue(v);
  if (f.type === "textarea" || f.type === "long") return v.replace(/[ \t]+$/gm, "");
  return v;
}

export const isFilled = (f: DocField, raw: string | undefined): boolean => wireValue(f, raw) !== "";

// Non-empty answers keyed by field, ready for preview / generate.
export function toWire(fields: DocField[], answers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = wireValue(f, answers[f.key]);
    if (v) out[f.key] = v;
  }
  return out;
}
