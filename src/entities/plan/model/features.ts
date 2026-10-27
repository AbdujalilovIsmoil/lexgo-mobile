import type { BillingPeriod } from "./period";

// TZ.md §13 / Studio tariffs §6: every feature of a plan is `unavailable` (locked), `limited` (a counter) or `unlimited`.
export type FeatureMode = "unavailable" | "limited" | "unlimited";

// One row of a tariff's entitlement contract: the catalogue's current version, or the snapshot a subscription was bought with.
export type FeatureTerm = { key: string; mode: FeatureMode; limit: number | null; unit: string; resetPeriod: string };

// The live state of a feature for the current paid period. The counters are the backend's; the phone never changes them.
// `allowed` false on a limited feature = its limit is used up for now.
export type PlanFeature = { key: string; mode: FeatureMode; allowed: boolean; limit: number | null; used: number | null; remaining: number | null; unit: string; resetsAt: string };
export type MyFeatures = { subscriptionId: string; planId: string; planVersion: number | null; active: boolean; consentRequired: boolean; items: PlanFeature[] };

// GET /subscriptions/{id}/contract: the tariff snapshot this subscription keeps until it renews, and — when a newer version of the tariff
// is published — what the next period will bring (`next`) and whether the client still has to agree to it.
export type ContractVersion = { version: number | null; terms: FeatureTerm[]; prices: Partial<Record<BillingPeriod, number>> };
export type PlanContract = ContractVersion & {
  subscriptionId: string;
  planId: string;
  status: string;
  title: string;
  names: Record<string, string>;
  billingPeriod: BillingPeriod | null;
  termsChanged: boolean;
  consentRequired: boolean;
  consentAccepted: boolean | null;
  next: ContractVersion | null;
};
