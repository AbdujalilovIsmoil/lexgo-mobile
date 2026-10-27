import { useQuery } from "@tanstack/react-query";
import { useLocaleStore } from "@/shared/i18n";
import { useIsAuthed } from "@/entities/session";
import { getEntitlements } from "../api/entitlementApi";
import { getContract, getMyFeatures } from "../api/featuresApi";
import { listPlans } from "../api/planApi";
import { getPlanQuote } from "../api/quoteApi";
import { findByKey } from "../lib/terms";
import type { PlanFeature } from "./features";
import type { BillingPeriod } from "./period";

export const planKeys = { list: (locale: string) => ["plans", locale] as const, one: (id: string, locale: string) => ["plans", locale, id] as const };
export const entitlementKeys = { all: ["entitlements"] as const };
export const featureKeys = { mine: ["plan-features"] as const, contracts: ["plan-contract"] as const, contract: (id: string) => ["plan-contract", id] as const };
// Memory only (not a "plans" key, so never persisted): a campaign can end at any time.
const quoteKey = (planId: string, period: BillingPeriod) => ["plan-quote", planId, period] as const;

export function usePlans() {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({ queryKey: planKeys.list(locale), queryFn: () => listPlans(locale), staleTime: 10 * 60 * 1000 });
}

export const useEntitlements = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: entitlementKeys.all, queryFn: getEntitlements, enabled: authed, staleTime: 60 * 1000 });
};

// TZ §13.1: the plan's features for the current paid period (refetched on app start, resume and socket reconnect by the startup sync, and
// after a subscription event by the payment sync) — the one reader of GET /subscriptions/me/features.
export const useMyFeatures = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: featureKeys.mine, queryFn: getMyFeatures, enabled: authed, staleTime: 60 * 1000 });
};

// One feature's backend state (null when the backend does not list it), read from the same features query.
export function useFeature(key: string): PlanFeature | null {
  const f = useMyFeatures().data;
  return f ? findByKey(f.items, key) ?? null : null;
}

export const useContract = (subscriptionId: string) => useQuery({ queryKey: featureKeys.contract(subscriptionId), queryFn: () => getContract(subscriptionId), enabled: !!subscriptionId, staleTime: 5 * 60 * 1000, retry: false });

// The checkout price of a plan for a period (TZ.md "Subscription plan quote"): one query per plan and period, shared by the tariff card, the
// period tiles and the request sheet. A free plan has no checkout, so the caller turns it off.
export const usePlanQuote = (planId: string, period: BillingPeriod, enabled = true) =>
  useQuery({ queryKey: quoteKey(planId, period), queryFn: () => getPlanQuote(planId, period), enabled: enabled && !!planId, staleTime: 60 * 1000 });
