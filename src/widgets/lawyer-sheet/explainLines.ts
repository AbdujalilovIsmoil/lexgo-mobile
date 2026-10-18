import type { PricingPolicy } from "@/entities/lawyer";
import { humanizeSlug } from "@/shared/lib/format";

type T = (k: string, p?: Record<string, string | number>) => string;

// "Toshkent ×1.15 · Samarqand ×1.05" — regions that change the price.
export function regionLine(p: PricingPolicy, t: T): string {
  const seen = new Map<string, number>();
  for (const r of [...p.regions].sort((a, b) => b.coef - a.coef)) {
    if (r.key === "default" || r.coef === 1) continue;
    const key = `mk2.explain.regions.${r.key}`;
    const name = t(key) !== key ? t(key) : humanizeSlug(r.key);
    if (!seen.has(name)) seen.set(name, r.coef);
  }
  return [...seen].slice(0, 4).map(([n, c]) => `${n} ×${c.toFixed(2)}`).join(" · ");
}

// "3–5 yil +10% · 6–10 yil +15% · 11+ yil +20%"
export function experienceLine(p: PricingPolicy, t: T): string {
  return p.experience
    .filter((x) => x.percent > 0)
    .map((x) => `${x.max >= 99 ? t("mk2.explain.tierFrom", { min: x.min }) : t("mk2.explain.tierRange", { min: x.min, max: x.max })} +${x.percent}%`)
    .join(" · ");
}

export function premiumLines(p: PricingPolicy, t: T): string[] {
  const out: string[] = [];
  if (p.clientRating.percent > 0) out.push(t("mk2.explain.clientRating", { rating: p.clientRating.rating, reviews: p.clientRating.reviews, percent: p.clientRating.percent }));
  if (p.seller.percent > 0) out.push(t("mk2.explain.sellerPremium", { percent: p.seller.percent }));
  if (p.sector.percent > 0) out.push(t("mk2.explain.sectorPremium", { years: p.sector.years, percent: p.sector.percent }));
  return out;
}
