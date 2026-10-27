import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { PLACEMENTS, advertisingMode, bannerBlock, chosenPackage, isRetryable, promotionErrorCode, promotionKeys, useCheckout, usePackages, usePending, type CheckoutResult, type Placement, type PromotionErrorCode } from "@/entities/promotion";
import { useProServices } from "@/entities/pro-service";
import { randomUUID } from "expo-crypto";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useErrorText } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { bannerSchema } from "./bannerSchema";
import { NO_BANNER, type Banner } from "./useBannerPick";

type Flow = { placement: Placement | null; serviceId: string; packageId: string; banner: Banner };
const asPlacement = (v?: string): Placement | null => (PLACEMENTS as readonly string[]).includes(v ?? "") ? (v as Placement) : null;
// Where each placement shows (the web's default when the catalog does not say).
const SURFACE: Record<Placement, string> = { banner: "marketplace_top_banner", profile_boost: "marketplace_list_card", service_boost: "category_search_sponsored_service" };

// The text key of a known checkout error. Marketplace advertising closed (409: test or paused mode, or readiness lost) and a locale the
// server refused (422) have their own plain texts; the rest are the web's list.
function codeKey(code: PromotionErrorCode, e: unknown): string {
  if (code === "marketplace_advertising_not_active") return { test: "prm.adTest", paused: "prm.adPaused", "": "prm.adOff" }[advertisingMode(e)];
  if (code === "marketplace_advertising_not_ready") return "prm.adNotReady";
  if (code === "promotion_language_invalid") return "prm.languageInvalid";
  return `promoSeller.ck.errors.${code}`;
}

// State of the promotion wizard: placement (+ service) → package → banner → checkout (provider telegram_manual, pending until approved).
export function useCheckoutFlow(uid: string, preset: { service?: string; placement?: string }) {
  const { t, locale } = useT();
  const errorText = useErrorText();
  const qc = useQueryClient();
  const [flow, setFlow] = useState<Flow>({ placement: preset.service ? "service_boost" : (asPlacement(preset.placement) ?? "profile_boost"), serviceId: preset.service ?? "", packageId: "", banner: NO_BANNER });
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState("");
  const catalog = usePackages(flow.placement ?? undefined, !!flow.placement);
  const services = useProServices();
  const checkout = useCheckout();
  const pending = usePending(uid);
  const attempt = useRef<{ sig: string; key: string } | null>(null);
  const placement = flow.placement;
  const packages = (catalog.data?.items ?? []).filter((p) => p.placement === placement);
  const pkg = chosenPackage(packages, flow.packageId);
  const options = catalog.data?.placements.find((p) => p.value === placement);
  const activeServices = (services.data?.items ?? []).filter((s) => s.status === "active" && s.catalogActive);
  const svc = activeServices.find((s) => s.id === flow.serviceId) ?? null;
  const needsService = !!pkg?.requiresService || placement === "service_boost" || !!options?.requiresService;
  const b = flow.banner;
  const accepts = !!(pkg?.acceptsBanner ?? options?.acceptsBanner ?? placement === "banner");
  const required = !!(pkg?.requiresBanner || options?.requiresBanner);
  const block = bannerBlock({ required, accepts, url: b.imageUrl, fileUrl: b.fileUrl, check: b.check, uploading: b.uploading });
  const ready = !!placement && !!pkg && (!needsService || !!svc) && !block && (!accepts || bannerSchema.safeParse(b).success);
  // Why the request cannot go yet, in the order the web tells it.
  const hint: "service" | "needed" | "review" | null = pkg && needsService && !svc ? "service" : block === "needed" ? "needed" : block === "review" ? "review" : null;
  const edit = (f: (x: Flow) => Flow) => { setError(""); setFlow(f); };
  const submit = async () => {
    if (!pkg || !placement || !ready) return;
    const sig = `${pkg.id}|${placement}|${flow.serviceId}`;
    // The same idempotency key is reused for a retry of the same request, so a lost answer cannot charge twice.
    if (attempt.current?.sig !== sig) attempt.current = { sig, key: randomUUID() };
    setError("");
    try {
      const r = await checkout.mutateAsync({
        packageId: pkg.id,
        days: pkg.days,
        placement,
        serviceId: needsService ? flow.serviceId : undefined,
        bannerImageUrl: accepts ? b.imageUrl.trim() : undefined,
        bannerFileUrl: accepts && b.check?.status === "active" ? b.fileUrl : undefined,
        title: accepts ? b.title : undefined, subtitle: accepts ? b.subtitle : undefined, ctaLabel: accepts ? b.ctaLabel : undefined, ctaUrl: accepts ? b.ctaUrl : undefined,
        previewSurface: options?.surface || SURFACE[placement],
        serviceTitle: needsService ? svc?.name : undefined,
        idempotencyKey: attempt.current.key,
        language: locale,
      });
      if (r.telegramSent) pending.add({ requestId: r.requestId, target: needsService ? `service:${flow.serviceId}` : placement, packageTitle: pkg.title, amount: r.amount || pkg.price, currency: r.currency, telegramSent: true, at: Date.now() });
      attempt.current = null;
      successHaptic();
      setResult(r);
    } catch (e) {
      errorHaptic();
      if (!isRetryable(e)) attempt.current = null;
      const code = promotionErrorCode(e);
      setError(code ? t(codeKey(code, e)) : e instanceof ApiError && e.status === 404 ? t("promoSeller.ck.notFound") : e instanceof ApiError ? errorText(e) : t("sl11.error"));
      // The state moved on the server (already running, package or service gone): show the fresh one.
      if (code === "promotion_already_exists" || (e instanceof ApiError && e.status === 404)) void qc.invalidateQueries({ queryKey: promotionKeys.all });
    }
  };
  return {
    flow, pkg, svc, packages, services: activeServices, loadingServices: services.isLoading, accepts, required, needsService, hint, bannerBlocked: !!block || (accepts && !bannerSchema.safeParse(b).success), error, ready,
    packagesQuery: catalog, loadingPackages: catalog.isLoading && !!placement, submitting: checkout.isPending, result, closeResult: () => setResult(null), submit,
    setPlacement: (p: Placement) => edit((f) => (f.placement === p ? f : { ...f, placement: p, packageId: "", serviceId: p === "service_boost" ? f.serviceId : "" })),
    setService: (id: string) => edit((f) => ({ ...f, serviceId: id })),
    setPackage: (id: string) => edit((f) => ({ ...f, packageId: id })),
    setBanner: (p: Partial<Banner>) => edit((f) => ({ ...f, banner: { ...f.banner, ...p } })),
  };
}
