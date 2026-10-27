import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkout, getAnalytics, getStatus, listPackages, uploadBanner } from "../api/promotionApi";
import type { AnalyticsFilter, CheckoutInput, Placement } from "./types";

export const promotionKeys = { all: ["promotion"] as const };
// What clients see running (GET /promotions/active: the marketplace banners, a seller's boosts), cached by entities/lawyer under this
// root and kept on the phone: read again whenever a promotion goes live or changes (TZ.md "Refresh GET /promotions/active").
export const PROMO_ACTIVE = ["promo-active"] as const;

export const usePackages = (placement?: Placement, enabled = true) => useQuery({ queryKey: [...promotionKeys.all, "packages", placement ?? "all"], queryFn: () => listPackages(placement), enabled, staleTime: 5 * 60 * 1000 });
export const usePromoStatus = () => useQuery({ queryKey: [...promotionKeys.all, "me"], queryFn: getStatus });
export const useAnalytics = (f: AnalyticsFilter = {}, enabled = true) => useQuery({ queryKey: [...promotionKeys.all, "analytics", f.placement ?? "", f.from ?? "", f.to ?? ""], queryFn: () => getAnalytics(f), enabled, placeholderData: (prev) => prev });

export const useUploadBanner = () => useMutation({ mutationFn: uploadBanner });

// The checkout only raises a pending request; its error (409 / 422 / 403) is shown inside the wizard. A package that needs no payment
// goes live at once: then the marketplace's running promotions are read again too.
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (i: CheckoutInput) => checkout(i),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: promotionKeys.all });
      if (r.activated) void qc.invalidateQueries({ queryKey: PROMO_ACTIVE });
    },
  });
}
