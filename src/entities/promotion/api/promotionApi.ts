import { http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import { asDict, asStr, listFrom, uzs } from "@/shared/lib/json";
import { normCatalog } from "./normalize";
import { normAnalytics, normRunning, normStatus } from "./normStatus";
import type { Analytics, CheckoutInput, CheckoutResult, Catalog, Placement, PromoStatus, Running } from "../model/types";

export const listPackages = async (placement?: Placement): Promise<Catalog> => normCatalog(await http(`/promotions/packages${placement ? `?placement=${placement}` : ""}`));
export const getStatus = async (): Promise<PromoStatus> => normStatus(await http("/promotions/me"));
export const getAnalytics = async (): Promise<Analytics> => normAnalytics(await http("/promotions/analytics"));

// GET /promotions/active?seller_user_id=… — what clients can see of this seller right now.
export async function listActive(sellerUserId: string): Promise<Running[]> {
  const qs = new URLSearchParams({ seller_user_id: sellerUserId, limit: "10" });
  return listFrom(await http(`/promotions/active?${qs}`), "items", "data", "promotions").map(normRunning);
}

// POST /promotions/banner-assets (multipart `file`) → the stored file's URL.
export async function uploadBanner(file: { uri: string; name: string }): Promise<string> {
  const form = new FormData();
  appendFile(form, "file", file);
  const d = asDict(await http("/promotions/banner-assets", { method: "POST", body: form }));
  return asStr(d.file_url ?? asDict(d.asset).file_url ?? asDict(d.data).file_url);
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
    idempotency_key: i.idempotencyKey,
  };
  // A single-service boost has its own route (TZ 20); profile and banner promotions use the general one.
  // Both take the same PromotionCheckoutRequest body and answer 404 "package not found" for an unknown package.
  const path = i.placement === "service_boost" && i.serviceId ? `/lawyers/me/services/${encodeURIComponent(i.serviceId)}/promotion-checkout` : "/promotions/checkout";
  const d = asDict(await http(path, { method: "POST", body }));
  const gate = asDict(d.payment_gate ?? d.payment);
  return {
    requestId: asStr(d.checkout_request_id ?? d.request_id ?? gate.id),
    workId: asStr(d.work_id ?? gate.work_id),
    amount: uzs(gate, "amount") || uzs(d, "amount"),
    currency: asStr(gate.currency ?? d.currency, "UZS") || "UZS",
    telegramSent: gate.telegram_sent === true || d.telegram_sent === true,
  };
}

// POST /promotions/events — a client-side impression / click of a promotion surface (used by the client marketplace).
export async function sendEvent(promotionId: string, eventType: "impression" | "click", source = "marketplace"): Promise<void> {
  await http("/promotions/events", { method: "POST", body: { promotion_id: promotionId, event_type: eventType, source } });
}
