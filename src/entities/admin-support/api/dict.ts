import { asArr, type Dict } from "@/shared/lib/json";

export const text = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" && Number.isFinite(v) ? String(v) : "");
export const firstText = (...values: unknown[]): string => values.map(text).find(Boolean) ?? "";
export const flag = (v: unknown): boolean | null => (v === true || v === 1 || v === "true" ? true : v === false || v === 0 || v === "false" ? false : null);
export const filled = (d: Dict) => Object.keys(d).length > 0;
export const currencyOf = (...values: unknown[]) => values.map(text).find(Boolean) || "UZS";

// Titles come from imported file names: strip the leftovers (underscore, .docx, double spaces).
export function cleanTitle(v: unknown): string {
  return text(v).replace(/^[_\s]+/, "").replace(/\.docx?$/i, "").replace(/\s+/g, " ").replace(/\.$/, "").trim();
}

// Some payload fields arrive as JSON strings.
export function dictOf(v: unknown): Dict {
  if (typeof v === "string" && v.trim().startsWith("{")) {
    try {
      return dictOf(JSON.parse(v));
    } catch {
      return {};
    }
  }
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Dict) : {};
}

export function listOf(v: unknown): unknown[] {
  if (typeof v === "string" && v.trim().startsWith("[")) {
    try {
      return asArr(JSON.parse(v));
    } catch {
      return [];
    }
  }
  return asArr(v);
}
