import { humanizeSlug } from "@/shared/lib/format";

// "refund" → "Qaytarish" in the UI language; unknown types are tidied.
export function typeLabel(t: (key: string) => string, type: string): string {
  if (!type) return t("admAppr.item");
  const v = t(`admAppr.type.${type}`);
  return v !== `admAppr.type.${type}` ? v : humanizeSlug(type);
}

export function statusText(t: (key: string) => string, status: string): string {
  const own = t(`admAppr.status.${status}`);
  if (own !== `admAppr.status.${status}`) return own;
  const shared = t(`admSt.${status}`);
  return shared !== `admSt.${status}` ? shared : humanizeSlug(status);
}
