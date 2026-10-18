export const PLACEMENTS = ["banner", "profile_boost", "service_boost"] as const;
export type Placement = (typeof PLACEMENTS)[number];

// A checked banner picture (POST /promotions/banner-assets): only an "active" one may be used in a request.
export type BannerStatus = "active" | "manual_review" | "rejected";
export type BannerCheck = { fileUrl: string; status: BannerStatus; reasons: string[]; suggestions: string[] };

export type PlacementOption = { value: Placement; requiresService: boolean; requiresBanner: boolean; acceptsBanner: boolean; surface: string };

// A package an admin put on sale (GET /promotions/packages).
export type PromoPackage = {
  id: string;
  title: string;
  price: number;
  currency: string;
  days: number;
  placement: Placement;
  boostScore: number;
  reach: number; // «up to Nx reach» (payload.reach), 0 = not stated
  requiresService: boolean;
  requiresBanner: boolean;
  acceptsBanner: boolean;
  surface: string; // where it shows: marketplace_top_banner / marketplace_list / category_search …
  surfaceLabel: string;
};
export type Catalog = { items: PromoPackage[]; placements: PlacementOption[] };

// A promotion that is live now (GET /promotions/me, /promotions/active).
export type Running = { id: string; placement: Placement; packageTitle: string; serviceId: string; serviceTitle: string; title: string; startsAt: string; endsAt: string; daysLeft: number; price: number };
export type PromoStatus = { active: boolean; daysLeft: number; endsAt: string; items: Running[] };

export type DayStat = { date: string; impressions: number; clicks: number };
export type Analytics = { impressions: number; searchAppearances: number; profileClicks: number; contactRequests: number; series: DayStat[] };

export type AnalyticsFilter = { placement?: Placement; from?: string; to?: string };

export type CheckoutInput = {
  packageId: string;
  days: number;
  placement: Placement;
  serviceId?: string;
  bannerImageUrl?: string;
  bannerFileUrl?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  previewSurface?: string;
  serviceTitle?: string;
  idempotencyKey: string;
};
// `telegramSent=false` means nobody was asked to approve it: the seller is told so.
// `activated=true`: no payment was needed and the promotion is already live.
export type CheckoutResult = { requestId: string; workId: string; amount: number; currency: string; telegramSent: boolean; activated: boolean };

export type PendingPromo = { requestId: string; target: string; packageTitle: string; amount: number; currency: string; telegramSent: boolean; at: number };
