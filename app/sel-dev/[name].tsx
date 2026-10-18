import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import ProOnboardingPage from "@/pages/pro-onboarding/ProOnboardingPage";
import ProProfilePage from "@/pages/pro-profile/ProProfilePage";
import ProServicesPage from "@/pages/pro-services/ProServicesPage";
import ProAvailabilityPage from "@/pages/pro-availability/ProAvailabilityPage";
import ProOrdersPage from "@/pages/pro-orders/ProOrdersPage";
import ProOrderPage from "@/pages/pro-orders/ProOrderPage";
import PromotionsPage from "@/pages/promotions/PromotionsPage";
import PromotionNewPage from "@/pages/promotions/PromotionNewPage";
import * as a from "@/zz-sel-dev/fx1";
import * as b from "@/zz-sel-dev/fx2";

// TEMPORARY: ungated seller pages with seeded query data (seller endpoints need an OTP-only account).
export default function Dev() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const qc = useQueryClient();
  useState(() => {
    for (const k of ["pro-onboarding", "pro-profile", "pro-availability", "pro-service", "pro-order", "promotion"]) qc.setQueryDefaults([k], { staleTime: Infinity });
    qc.setQueryData(["pro-onboarding", "cabinet"], a.cabinet);
    qc.setQueryData(["pro-onboarding", "progress"], a.progress);
    qc.setQueryData(["pro-onboarding", "docs"], a.docs);
    qc.setQueryData(["pro-profile", "me"], a.profile);
    qc.setQueryData(["pro-profile", "account"], a.account);
    qc.setQueryData(["pro-availability"], a.avail);
    qc.setQueryData(["pro-service", "me", "list"], a.services);
    qc.setQueryData(["pro-order", "list"], b.orders);
    for (const id of ["o1", "o2", "o3"]) { qc.setQueryData(["pro-order", "history", id], b.history); qc.setQueryData(["pro-order", "milestones", id], b.miles); }
    qc.setQueryData(["promotion", "me"], b.status);
    qc.setQueryData(["promotion", "analytics"], b.analytics);
    for (const k of Object.keys(b.pkgs)) qc.setQueryData(["promotion", "packages", k], { items: (b.pkgs as Record<string, unknown[]>)[k], placements: [] });
    return 1;
  });
  const pages: Record<string, React.ReactElement> = { onb: <ProOnboardingPage />, profile: <ProProfilePage />, services: <ProServicesPage />, avail: <ProAvailabilityPage />, orders: <ProOrdersPage />, promos: <PromotionsPage />, promonew: <PromotionNewPage /> };
  return pages[name ?? "onb"] ?? <ProOrderPage />;
}
