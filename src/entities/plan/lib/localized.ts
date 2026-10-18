import { asArr, asStr, type Dict } from "@/shared/lib/json";

// The backend ships plan names/features as { uz, ru, en } maps; pick the UI locale, then uz.
export function pickLoc(v: unknown, locale: string, fallback: string): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const d = v as Dict;
    return asStr(d[locale] ?? d.uz ?? fallback);
  }
  return asStr(v ?? fallback);
}

export function pickLocArr(v: unknown, locale: string, fallback: unknown): string[] {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const arr = (v as Dict)[locale] ?? (v as Dict).uz;
    if (Array.isArray(arr)) return arr.map((x) => asStr(x));
  }
  if (Array.isArray(v)) return v.map((x) => asStr(x));
  return asArr(fallback).map((x) => asStr(x));
}
