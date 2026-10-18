import { humanizeSlug } from "@/shared/lib/format";

// "advokat" → "Advokat" in the UI language; unknown types are tidied, empty stays empty.
export function sellerTypeLabel(t: (key: string) => string, type: string): string {
  if (!type) return "";
  const v = t(`admRev.type.${type}`);
  return v !== `admRev.type.${type}` ? v : humanizeSlug(type);
}
