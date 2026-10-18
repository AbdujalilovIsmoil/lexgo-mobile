import { humanizeSlug } from "@/shared/lib/format";

type T = (key: string) => string;

// Translated label when the key exists, else the tidied raw value.
const pick = (t: T, key: string, raw: string): string => {
  const v = t(key);
  return v !== key ? v : humanizeSlug(raw);
};

export const roleLabel = (t: T, role: string): string => (role ? pick(t, `admReg.role.${role}`, role) : "");
export const statusLabel = (t: T, status: string): string => (status ? pick(t, `admReg.status.${status}`, pick(t, `admSt.${status}`, status)) : "");
