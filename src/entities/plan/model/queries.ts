import { useQuery } from "@tanstack/react-query";
import { useLocaleStore } from "@/shared/i18n";
import { useIsAuthed } from "@/entities/session";
import { getEntitlements } from "../api/entitlementApi";
import { getContract, getMyFeatures } from "../api/featuresApi";
import { getPlan, listPlans } from "../api/planApi";

export const planKeys = { list: (locale: string) => ["plans", locale] as const, one: (id: string, locale: string) => ["plans", locale, id] as const };
export const entitlementKeys = { all: ["entitlements"] as const };
export const featureKeys = { mine: ["plan-features"] as const, contract: (id: string) => ["plan-contract", id] as const };

export function usePlans() {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({ queryKey: planKeys.list(locale), queryFn: () => listPlans(locale), staleTime: 10 * 60 * 1000 });
}

// GET /subscription-plans/{id}: the detail sheet reads it fresh (functions, limits, periods).
export function usePlan(id: string | null) {
  const locale = useLocaleStore((s) => s.locale);
  return useQuery({ queryKey: planKeys.one(id ?? "", locale), queryFn: () => getPlan(id ?? "", locale), enabled: !!id, staleTime: 5 * 60 * 1000 });
}

export const useEntitlements = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: entitlementKeys.all, queryFn: getEntitlements, enabled: authed, staleTime: 60 * 1000 });
};

// TZ §12: the plan's features for the current paid period (refetched on app start, resume and socket reconnect by the startup sync).
export const useMyFeatures = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: featureKeys.mine, queryFn: getMyFeatures, enabled: authed, staleTime: 60 * 1000 });
};

export const useContract = (subscriptionId: string) => useQuery({ queryKey: featureKeys.contract(subscriptionId), queryFn: () => getContract(subscriptionId), enabled: !!subscriptionId, staleTime: 5 * 60 * 1000, retry: false });
