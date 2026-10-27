import { asStr, type Dict } from "@/shared/lib/json";

// The backend ships plan names as { uz, ru, en } maps; pick the UI locale, then uz.
export function pickLoc(v: unknown, locale: string, fallback: string): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const d = v as Dict;
    return asStr(d[locale] ?? d.uz ?? fallback);
  }
  return asStr(v ?? fallback);
}
