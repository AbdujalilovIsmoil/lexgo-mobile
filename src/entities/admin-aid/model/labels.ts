import { humanizeSlug } from "@/shared/lib/format";

type T = (key: string) => string;

// First translation that exists (own namespace, then the shared status names), else the tidied raw value.
export function aidStatus(t: T, status: string): string {
  for (const key of [`admAid.status.${status}`, `admSt.${status}`]) if (t(key) !== key) return t(key);
  return status ? humanizeSlug(status) : t("admAid.new");
}

// "intake" / "created" → "Murojaat" / "Yaratildi".
export function aidMapped(t: T, group: "sourceMap" | "eventMap", value: string): string {
  const key = `admAid.${group}.${value}`;
  return !value ? "" : t(key) !== key ? t(key) : humanizeSlug(value);
}
