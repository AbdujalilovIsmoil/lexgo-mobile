import type { Dict } from "@/shared/lib/json";
import type { StudioPayload } from "../model/types";

export type Draft = { title: string; payload: StudioPayload };

export const draftKey = (d: Draft | null): string => {
  try {
    return d ? JSON.stringify([d.title.trim(), d.payload]) : "";
  } catch {
    return "";
  }
};

export function isBlank(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return !v.trim();
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}

export const requiredErrors = (payload: Dict, required: string[]): Record<string, string> => Object.fromEntries(required.filter((f) => isBlank(payload[f])).map((f) => [f, "@required"]));

// "1.4" → "1.5"; the placeholder of the version field in "save with a note".
export function nextMinor(v: string): string {
  const m = /^(\d+)(?:\.(\d+))?/.exec(v.trim());
  return m ? `${m[1]}.${(m[2] ? parseInt(m[2], 10) : 0) + 1}` : "1.0";
}
export const versionOk = (v: string): boolean => !v.trim() || /^\d{1,4}(\.\d{1,4}){0,2}$/.test(v.trim());
export const fileExt = (name: string): string => /\.([a-z0-9]{1,5})$/i.exec(name.trim())?.[1].toLowerCase() ?? "";
