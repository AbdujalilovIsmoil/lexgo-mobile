export type PlanAudience = "client" | "yurist" | "advokat" | "business";
export type BillingPeriod = "monthly" | "six_month" | "yearly" | "prepaid_yearly";

export type Plan = {
  id: string;
  name: string; // localized display name
  title: string; // raw admin-editable title
  slug: string;
  monthlyPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  prepaidYearlyPrice: number;
  audience: string;
  targetRoles: string[];
  autoChargeProvider: string;
  billingType: string;
  sortOrder: number;
  allowedGiftDurations: number[];
  description: string;
  benefits: string[];
  isGiftable: boolean;
  isActive: boolean;
  overridden: boolean; // an admin overlay changes this plan
  hidden: boolean; // "deleted" through the overlay (or a legacy plan hidden by default)
};

// Body of POST / PATCH /admin/subscription-plans (whole so'm).
export type PlanInput = Partial<{
  slug: string;
  title: string;
  description: string;
  audience: string;
  target_roles: string[];
  auto_charge_provider: string;
  billing_type: string;
  sort_order: number;
  allowed_gift_durations: number[];
  monthly_price: number;
  six_month_price: number;
  yearly_price: number;
  prepaid_yearly_price: number;
  benefits: string[];
  is_giftable: boolean;
  is_active: boolean;
}>;

export type PlanOverride = Partial<{ hidden: boolean; title: string; description: string; audience: string; monthly_price: number; six_month_price: number; yearly_price: number; prepaid_yearly_price: number; benefits: string[]; is_giftable: boolean; is_active: boolean }>;
