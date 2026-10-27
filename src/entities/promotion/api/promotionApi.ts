import { ApiError, http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import { asDict, asStr } from "@/shared/lib/json";
import { normBannerCheck, normCatalog, normCheckout } from "./normalize";
import { normAnalytics, normStatus } from "./normStatus";
import type { Analytics, BannerCheck, BannerUpload, AnalyticsFilter, CheckoutInput, CheckoutResult, Catalog, Placement, PromoStatus } from "../model/types";

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

// A picture the backend turns down may also come back as an error (4xx) carrying the check: it is shown like any other verdict
// (rejected, or in manual review), without a stored file. Any other failure is not a check (null).
function refusedCheck(e: unknown): BannerCheck | null {
  if (!(e instanceof ApiError) || e.status < 400 || e.status >= 500) return null;
  const detail = asDict(e.data.detail);
  const vision = asDict(detail.vision_validation ?? e.data.vision_validation ?? asDict(detail.context).vision_validation);
  if (!Object.keys(vision).length) return null;
  const message = asStr(vision.message).trim() || asStr(detail.message).trim();
  const check = normBannerCheck({ status: vision.manual_review === true ? "manual_review" : "rejected", vision_validation: { ...vision, message } });
  return { ...check, fileUrl: "" };
}

// POST /promotions/banner-assets (multipart `file` + `language`, the app's language: the check's message, reasons and suggestions come
// back in it) → the stored file's URL and the picture check (active · manual_review · rejected).
export async function uploadBanner({ file, language }: BannerUpload): Promise<BannerCheck> {
  const form = new FormData();
  appendFile(form, "file", file);
  form.append("language", language);
  try {
    return normBannerCheck(await http("/promotions/banner-assets", { method: "POST", body: form }));
  } catch (e) {
    const refused = refusedCheck(e);
    if (refused) return refused;
    throw e;
  }
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
    language: i.language, // a linked picture is checked again on the server, in this language
  };
  // A single-service boost has its own route (TZ 20); profile and banner promotions use the general one.
  // Both take the same PromotionCheckoutRequest body and answer 404 "package not found" for an unknown package. While marketplace
  // advertising is not open (test or paused mode, or readiness lost) both answer 409 — see lib/errors.ts.
  const path = i.placement === "service_boost" && i.serviceId ? `/lawyers/me/services/${encodeURIComponent(i.serviceId)}/promotion-checkout` : "/promotions/checkout";
  const d = asDict(await http(path, { method: "POST", body }));
  return normCheckout(d);
}

// POST /promotions/events — a client-side impression / click of a promotion surface (used by the client marketplace).
export async function sendEvent(promotionId: string, eventType: "impression" | "click", source = "marketplace"): Promise<void> {
  await http("/promotions/events", { method: "POST", body: { promotion_id: promotionId, event_type: eventType, source } });
}
