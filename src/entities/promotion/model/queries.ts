import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkout, getAnalytics, getStatus, listPackages, uploadBanner } from "../api/promotionApi";
import type { AnalyticsFilter, CheckoutInput, Placement } from "./types";

export const promotionKeys = { all: ["promotion"] as const };

export const usePackages = (placement?: Placement, enabled = true) => useQuery({ queryKey: [...promotionKeys.all, "packages", placement ?? "all"], queryFn: () => listPackages(placement), enabled, staleTime: 5 * 60 * 1000 });
export const usePromoStatus = () => useQuery({ queryKey: [...promotionKeys.all, "me"], queryFn: getStatus });
export const useAnalytics = (f: AnalyticsFilter = {}, enabled = true) => useQuery({ queryKey: [...promotionKeys.all, "analytics", f.placement ?? "", f.from ?? "", f.to ?? ""], queryFn: () => getAnalytics(f), enabled, placeholderData: (prev) => prev });

export const useUploadBanner = () => useMutation({ mutationFn: uploadBanner });

// The checkout only raises a pending request; its error (409 / 422 / 403) is shown inside the wizard.
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (i: CheckoutInput) => checkout(i),
    onSuccess: () => void qc.invalidateQueries({ queryKey: promotionKeys.all }),
  });
}
