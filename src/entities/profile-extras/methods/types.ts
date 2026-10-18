export type PayMethod = { id: string; brand: string; last4: string; expires: string; isDefault: boolean; createdAt: string };
export type MethodInput = { brand: string; last4: string; expires: string; isDefault: boolean };
export const BRANDS = ["uzcard", "humo", "visa", "mastercard"] as const;

// "1230" or "12/30" → "12/30"; "" when it is not a real month/year.
export function normExpiry(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
export const validExpiry = (v: string): boolean => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
