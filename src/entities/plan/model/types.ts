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
  audiences: string[]; // who the plan is for (lower case); empty = the backend says nothing, so everybody sees it
  targetRoles: string[];
  description: string;
  features: string[];
  functions: PlanFunction[];
  entitlements: Record<string, unknown>;
  contract: FeatureTerm[]; // the current published version's entitlement contract: what a new period of this tariff gives
  version: number; // 1 when the backend names none (see `versioned`)
  versioned: boolean; // the backend named the published version, so it is shown
  effectiveFrom: string; // ISO date the version took effect, "" when not sent
  isGiftable: boolean;
  isActive: boolean;
  sortOrder: number;
  billingType: string;
  autoChargeProvider: string;
  allowedBillingPeriods: string[];
  giftDurations: number[];
};

// A gift tariff is bought FOR someone else (Sovg'alar), never as a self-subscription.
export const isGiftPlan = (plan: Plan): boolean => plan.isGiftable || plan.billingType === "gift";
