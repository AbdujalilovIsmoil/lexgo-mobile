import { http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import { asDict, listFrom } from "@/shared/lib/json";
import { normBannerCheck, normCatalog, normCheckout } from "./normalize";
import { normAnalytics, normRunning, normStatus } from "./normStatus";
import type { Analytics, BannerCheck, AnalyticsFilter, CheckoutInput, CheckoutResult, Catalog, Placement, PromoStatus, Running } from "../model/types";

// Only packages on sale (status=active), like the web checkout.
export const listPackages = async (placement?: Placement): Promise<Catalog> => normCatalog(await http(`/promotions/packages?status=active${placement ? `&placement=${placement}` : ""}`), placement);
export const getStatus = async (): Promise<PromoStatus> => normStatus(await http("/promotions/me"));
// GET /promotions/analytics?placement=&date_from=&date_to= (the web sends the same filters).
export async function getAnalytics(f: AnalyticsFilter = {}): Promise<Analytics> {
  const qs = new URLSearchParams();
  if (f.placement) qs.set("placement", f.placement);
  if (f.from) qs.set("date_from", f.from);
  if (f.to) qs.set("date_to", f.to);
  return normAnalytics(await http(`/promotions/analytics${qs.size ? `?${qs}` : ""}`));
}

// GET /promotions/active?seller_user_id=… — what clients can see of this seller right now.
export async function listActive(sellerUserId: string): Promise<Running[]> {
  const qs = new URLSearchParams({ seller_user_id: sellerUserId, limit: "10" });
  return listFrom(await http(`/promotions/active?${qs}`), "items", "data", "promotions").map(normRunning);
}

// POST /promotions/banner-assets (multipart `file`) → the stored file's URL and the picture check (active · manual_review · rejected).
export async function uploadBanner(file: { uri: string; name: string }): Promise<BannerCheck> {
  const form = new FormData();
  appendFile(form, "file", file);
  return normBannerCheck(await http("/promotions/banner-assets", { method: "POST", body: form }));
}

// The provider is always telegram_manual: an admin approves the request inline in Telegram and
// only then is the promotion live — the app never marks anything as paid (TZ 27, 45.5).
export async function checkout(i: CheckoutInput): Promise<CheckoutResult> {
  const body = {
    package_id: i.packageId,
    days: i.days,
    provider: "telegram_manual",
    placement: i.placement,
    service_id: i.serviceId || undefined,
    banner_image_url: i.bannerImageUrl || undefined,
    banner_file_url: i.bannerFileUrl || undefined,
    banner_title: i.title?.trim() || undefined,
    banner_subtitle: i.subtitle?.trim() || undefined,
    banner_cta_label: i.ctaLabel?.trim() || undefined,
    banner_cta_url: i.ctaUrl?.trim() || undefined,
    preview_context: { surface: i.previewSurface || undefined, placement: i.placement, service_title: i.serviceTitle || undefined },
    idempotency_key: i.idempotencyKey,
  };
  // A single-service boost has its own route (TZ 20); profile and banner promotions use the general one.
  // Both take the same PromotionCheckoutRequest body and answer 404 "package not found" for an unknown package.
  const path = i.placement === "service_boost" && i.serviceId ? `/lawyers/me/services/${encodeURIComponent(i.serviceId)}/promotion-checkout` : "/promotions/checkout";
  const d = asDict(await http(path, { method: "POST", body }));
  return normCheckout(d);
}

// POST /promotions/events — a client-side impression / click of a promotion surface (used by the client marketplace).
export async function sendEvent(promotionId: string, eventType: "impression" | "click", source = "marketplace"): Promise<void> {
  await http("/promotions/events", { method: "POST", body: { promotion_id: promotionId, event_type: eventType, source } });
}
