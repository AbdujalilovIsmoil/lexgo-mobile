import type { FeatureTerm } from "./features";

export type PlanFunction = { key: string; title: string; description: string; enabled: boolean; limit: number | null; unit: string };

export type Plan = {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  prepaidYearlyPrice: number;
  audience: string;
  targetRoles: string[];
  description: string;
  features: string[];
  functions: PlanFunction[];
  entitlements: Record<string, unknown>;
  contract: FeatureTerm[]; // the current published version's entitlement contract: what a new period of this tariff gives
  version: number;
  isGiftable: boolean;
  isActive: boolean;
  sortOrder: number;
  billingType: string;
  autoChargeProvider: string;
  allowedBillingPeriods: string[];
  giftDurations: number[];
};

// Plans sold to a client (the mobile audience). Mirrors planForRole() on the web.
export function isClientPlan(plan: Plan): boolean {
  if (plan.targetRoles.length) return plan.targetRoles.includes("client");
  const a = plan.audience.toLowerCase();
  if (a === "personal" || a === "client") return true;
  if (a) return false;
  return plan.slug.toLowerCase().includes("shaxsiy");
}

// A gift tariff is bought FOR someone else (Sovg'alar), never as a self-subscription.
export const isGiftPlan = (plan: Plan): boolean => plan.isGiftable || plan.billingType === "gift";
