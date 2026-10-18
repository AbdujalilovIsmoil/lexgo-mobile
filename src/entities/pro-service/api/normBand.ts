import { asDict, asStr, uzs } from "@/shared/lib/json";
import type { Modifier, PriceBand } from "../model/types";

const nz = (v: unknown): number | null => (v === undefined || v === null || v === "" || typeof v === "boolean" ? null : Number.isFinite(Number(v)) ? Number(v) : null);

const ALIAS: Record<string, string> = { seller: "seller_premium", super_seller: "seller_premium", premium: "seller_premium", client_rating: "client_rating_premium", rating: "client_rating_premium", sector: "sector_experience_premium", sector_experience: "sector_experience_premium", region_multiplier: "region", experience_multiplier: "experience", referral_discount: "referral" };
const codeOf = (s: string) => {
  const c = s.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ALIAS[c] ?? c;
};

// modifiers arrive as a list of {code,key,percent,multiplier,amount} (or a {code: value} map).
export function normModifiers(v: unknown): Modifier[] {
  const rows: [string, unknown][] = Array.isArray(v) ? v.map((x) => ["", x]) : Object.entries(asDict(v));
  return rows
    .map(([hint, x]): Modifier | null => {
      const d = asDict(x);
      const num = typeof x === "number" ? x : null;
      const code = codeOf(asStr(d.code ?? d.type ?? d.kind ?? d.modifier) || hint || asStr(d.key));
      if (!code) return null;
      const mult = nz(d.multiplier ?? d.coefficient ?? d.factor) ?? (num !== null && num > 0 && num < 3 && !Number.isInteger(num) ? num : null);
      return { code, key: asStr(d.key ?? d.region ?? d.tier), label: asStr(d.label ?? d.title).trim(), percent: nz(d.percent ?? d.percentage) ?? (num !== null && mult === null ? num : null), multiplier: mult, amount: nz(d.amount ?? d.delta) };
    })
    .filter((m): m is Modifier => m !== null);
}

// pricing_limits / 422 body → corridor; null when the server gave no usable ceiling.
export function normBand(v: unknown): PriceBand | null {
  const d = asDict(v);
  const max = uzs(d, "max_allowed", "max_price", "recommended_price");
  const min = uzs(d, "min_allowed", "min_price");
  if (!max || min > max) return null;
  const base = nz(d.base_price ?? d.base_amount);
  return { recommended: uzs(d, "recommended_price", "recommended", "max_allowed"), min, max, base, currency: asStr(d.currency) || "UZS", modifiers: d.modifiers != null ? normModifiers(d.modifiers) : null };
}

