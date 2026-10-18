import type { Dict } from "@/shared/lib/json";
import type { Errors } from "../form/types";
import { recList, str } from "../form/values";

export const TIERS = ["BASIC", "STANDARD", "PREMIUM"] as const;

const blank = (tier: string): Dict => ({ tier, title: "", description: "", duration: "", included: [] });

// Exactly BASIC / STANDARD / PREMIUM, in that order: existing values are matched by their `tier`, missing ones are empty.
export const tiersOf = (v: unknown): Dict[] => TIERS.map((tier) => ({ ...blank(tier), ...(recList(v).find((x) => str(x.tier).toUpperCase() === tier) ?? {}), tier }));

// Tier prices are free: no bound derived from the component services (only >= 0). Components / custom items are checked by the schema.
export function validateK03M(payload: Dict): Errors {
  const out: Errors = {};
  const raw = recList(payload.tiers).map((x) => str(x.tier).toUpperCase());
  if (raw.length !== 3 || TIERS.some((t) => raw.filter((r) => r === t).length !== 1)) out.tiers = "@tiers";
  tiersOf(payload.tiers).forEach((x, i) => {
    const v = x.price;
    if (v === undefined || v === null || v === "") out[`tiers.${i}.price`] = "@required";
    else if (!Number.isFinite(Number(v))) out[`tiers.${i}.price`] = "@number";
    else if (Number(v) < 0) out[`tiers.${i}.price`] = "@negative";
  });
  return out;
}
