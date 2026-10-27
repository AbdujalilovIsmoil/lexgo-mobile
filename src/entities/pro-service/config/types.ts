import type { ServiceRule } from "@/entities/service-rules/model/types";

// A criterion value as the backend sent it: a number, a text, a flag or a structured object (seller_performance).
export type ReqValue = number | string | boolean | Record<string, unknown> | null;

// One pricing criterion the backend evaluated (TZ.md "Pricing Growth" §2): `met` and `progress` are its verdict, never ours.
export type Requirement = {
  key: string; // lawyer_experience | sector_experience | seller_performance | client_rating | a future key
  label: string; // the backend's own name, when it sends one
  current: ReqValue;
  required: ReqValue; // may hold { any_of: [...] }: one alternative is enough
  unit: string; // "year" | "mixed" | …
  met: boolean;
  progress: number | null; // progress_percent exactly as given; only the bar is clamped
  note: string;
};

// GET / PATCH /marketplace/me/services/{id}/configuration (TZ.md §5.3 + "Pricing Growth" §2). Money is whole so'm, 0 = not set.
export type ServiceConfig = {
  serviceId: string;
  enabled: boolean | null;
  status: string; // the backend's word, lowercased ("active", "rules_pending" …)
  selectedPrice: number;
  minimumListingPrice: number;
  maximumPrice: number;
  recommendedPrice: number;
  maxDiscountPercent: number | null; // maximum_listing_discount_percent
  negotiationAllowed: boolean | null; // null = the answer did not say
  negotiationAvailable: boolean | null;
  negotiationMinimumPrice: number;
  priceExplanation: string;
  priceExplanationLines: string[];
  maxIncreasePercent: number; // maximum_increase_percent as given; 0 hides the growth note
  requirements: Requirement[];
  rulesAccepted: boolean | null;
  rulesStatus: string;
  rulesPending: boolean; // switching it on is refused until the missing rules are accepted
  missingRuleIds: string[];
  requiredRules: ServiceRule[];
  selectableRules: ServiceRule[]; // the seller picks which apply
  selectedRuleIds: string[] | null; // null = unknown: never sent back
};

// What a PATCH may change; a field left out is not sent.
export type ConfigPatch = { enabled?: boolean; selectedPrice?: number; negotiationAllowed?: boolean; selectedRuleIds?: string[] };
