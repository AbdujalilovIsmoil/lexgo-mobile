import { useRef, useState } from "react";
import { ApiError } from "@/shared/api";
import { PLACEMENTS, useCheckout, usePackages, usePending, type CheckoutResult, type Placement } from "@/entities/promotion";
import { useProServices } from "@/entities/pro-service";
import { randomUUID } from "expo-crypto";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { bannerSchema } from "./bannerSchema";
import { NO_BANNER, type Banner } from "./useBannerPick";

type Flow = { placement: Placement | null; serviceId: string; packageId: string; banner: Banner };
const asPlacement = (v?: string): Placement | null => (PLACEMENTS as readonly string[]).includes(v ?? "") ? (v as Placement) : null;

// State of the promotion wizard: placement → target → package → preview → checkout (provider telegram_manual, pending until approved).
export function useCheckoutFlow(uid: string, preset: { service?: string; placement?: string }) {
  const { t } = useT();
  const [flow, setFlow] = useState<Flow>({ placement: preset.service ? "service_boost" : asPlacement(preset.placement), serviceId: preset.service ?? "", packageId: "", banner: NO_BANNER });
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const catalog = usePackages(flow.placement ?? undefined, !!flow.placement);
  const services = useProServices();
  const checkout = useCheckout();
  const pending = usePending(uid);
  const attempt = useRef<{ sig: string; key: string } | null>(null);
  const packages = (catalog.data?.items ?? []).filter((p) => p.placement === flow.placement);
  const pkg = packages.find((p) => p.id === flow.packageId) ?? null;
  const svc = services.data?.items.find((s) => s.id === flow.serviceId) ?? null;
  const b = flow.banner;
  const ready = !!flow.placement && !!pkg && (flow.placement !== "service_boost" || !!svc) && bannerSchema.safeParse(b).success;
  const submit = async () => {
    if (!pkg || !flow.placement || !ready) return;
    const sig = `${pkg.id}|${flow.placement}|${flow.serviceId}`;
    // The same idempotency key is reused for a retry of the same request, so a lost answer cannot charge twice.
    if (attempt.current?.sig !== sig) attempt.current = { sig, key: randomUUID() };
    try {
      const r = await checkout.mutateAsync({ packageId: pkg.id, days: pkg.days, placement: flow.placement, serviceId: flow.placement === "service_boost" ? flow.serviceId : undefined, bannerImageUrl: flow.placement === "banner" ? b.imageUrl : undefined, bannerFileUrl: flow.placement === "banner" ? b.fileUrl : undefined, title: b.title, subtitle: b.subtitle, ctaLabel: b.ctaLabel, ctaUrl: b.ctaUrl, idempotencyKey: attempt.current.key });
      pending.add({ requestId: r.requestId, target: flow.placement === "service_boost" ? `service:${flow.serviceId}` : flow.placement, packageTitle: pkg.title, amount: r.amount || pkg.price, currency: r.currency, telegramSent: r.telegramSent, at: Date.now() });
      attempt.current = null;
      successHaptic();
      setResult(r);
    } catch (e) {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("sl11.error"), "err");
    }
  };
  return {
    flow, pkg, svc, packages, services: services.data?.items ?? [], loadingPackages: catalog.isLoading && !!flow.placement, ready, submitting: checkout.isPending, result, closeResult: () => setResult(null), submit,
    setPlacement: (p: Placement) => setFlow((f) => ({ ...f, placement: p, packageId: "", serviceId: p === "service_boost" ? f.serviceId : "" })),
    setService: (id: string) => setFlow((f) => ({ ...f, serviceId: id })),
    setPackage: (id: string) => setFlow((f) => ({ ...f, packageId: id })),
    setBanner: (p: Partial<Banner>) => setFlow((f) => ({ ...f, banner: { ...f.banner, ...p } })),
  };
}
