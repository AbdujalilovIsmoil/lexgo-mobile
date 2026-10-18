import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUrgentCatalog, listPlans } from "../api/catalogApi";
import { getDocTypes, searchDocServices } from "../api/docLookupApi";
import { listEligibleSellers } from "../api/packageSellerApi";
import { getSellerServices, searchSellers } from "../api/sellerApi";
import { supKeys } from "./keys";

const FIVE_MIN = 5 * 60_000;
const k = (...p: (string | number)[]) => [...supKeys.all, "lookup", ...p];

export const usePlans = (locale: string, enabled: boolean) =>
  useQuery({ queryKey: k("plans", locale), queryFn: () => listPlans(locale), enabled, staleTime: FIVE_MIN });
export const useUrgentCatalog = (enabled: boolean) => useQuery({ queryKey: k("urgent"), queryFn: getUrgentCatalog, enabled, staleTime: FIVE_MIN });
export const useDocTypes = (enabled: boolean) => useQuery({ queryKey: k("doctypes"), queryFn: getDocTypes, enabled, staleTime: FIVE_MIN, retry: false });
export const useDocServices = (q: string) => useQuery({ queryKey: k("docsvc", q), queryFn: () => searchDocServices(q), enabled: q.trim().length >= 2, staleTime: 60_000, placeholderData: keepPreviousData });
export const useSellers = (q: string, enabled: boolean) => useQuery({ queryKey: k("sellers", q), queryFn: () => searchSellers(q), enabled, staleTime: 60_000, placeholderData: keepPreviousData });
export const useSellerServices = (userId: string) => useQuery({ queryKey: k("sellersvc", userId), queryFn: () => getSellerServices(userId), enabled: !!userId, staleTime: 60_000 });
export const useEligibleSellers = (packageId: string) => useQuery({ queryKey: k("eligible", packageId), queryFn: () => listEligibleSellers(packageId), enabled: !!packageId, staleTime: 60_000 });
