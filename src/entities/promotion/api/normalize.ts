import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { PLACEMENTS, type BannerCheck, type BannerStatus, type Catalog, type CheckoutResult, type Placement, type PlacementOption, type PromoPackage } from "../model/types";

export const placementOf = (v: unknown): Placement => {
  const s = asStr(v).trim().toLowerCase();
  return (PLACEMENTS as readonly string[]).includes(s) ? (s as Placement) : "service_boost";
};

function normPackage(v: unknown): PromoPackage {
  const d = asDict(v);
  const p = asDict(d.payload);
  const prev = asDict(d.preview ?? p.preview);
  const placement = placementOf(d.placement ?? p.placement);
  return {
    id: asStr(d.id ?? d.package_id),
    title: asStr(d.title ?? d.name).trim(),
    price: uzs(d, "price") || uzs(p, "price"),
    currency: asStr(d.currency, "UZS") || "UZS",
    days: Math.max(1, Math.round(asNum(d.days ?? p.days, 7))),
    placement,
    boostScore: asNum(d.boost_score ?? p.boost_score),
    reach: asNum(d.reach ?? p.reach),
    requiresService: d.requires_service === true || placement === "service_boost",
    requiresBanner: d.requires_banner === true,
    acceptsBanner: d.accepts_banner_asset === true || placement === "banner",
    surface: asStr(prev.surface),
    surfaceLabel: asStr(prev.label).trim(),
  };
}

function normPlacement(v: unknown): PlacementOption {
  const d = asDict(v);
  const value = placementOf(d.key ?? d.value ?? d.placement);
  return { value, requiresService: d.requires_service === true || value === "service_boost", requiresBanner: d.requires_banner === true, acceptsBanner: d.accepts_banner_asset === true || value === "banner", surface: asStr(d.preview_surface) };
}

const messages = (v: unknown): string[] => asArr(v).map((x) => (typeof x === "string" ? x : asStr(asDict(x).message ?? asDict(x).text ?? asDict(x).reason)).trim()).filter(Boolean);

// The banner-asset answer: a stored file plus the picture check. Anything but rejected / manual review counts as passed. Only the
// backend's localized texts are kept — vision_validation.message, reasons[] and suggestions[] — never the technical reason_codes;
// a reason that repeats the message is dropped.
export function normBannerCheck(v: unknown): BannerCheck {
  const n = asDict(v);
  const a = asDict(n.asset ?? n.data);
  const vision = asDict(n.vision_validation ?? a.vision_validation);
  const raw = asStr(n.status ?? a.status).toLowerCase();
  const status: BannerStatus = raw === "rejected" ? "rejected" : raw === "manual_review" || raw === "pending_review" ? "manual_review" : "active";
  const message = asStr(vision.message).trim();
  return {
    fileUrl: asStr(n.file_url ?? a.file_url),
    status,
    message,
    reasons: messages(vision.reasons ?? n.reasons).filter((r) => r !== message),
    suggestions: messages(vision.suggestions ?? n.suggestions),
  };
}

// POST /promotions/checkout answer. `payment_required:false` (or an active status) means it is live already, no Telegram step.
export function normCheckout(d: Record<string, unknown>): CheckoutResult {
  const gate = asDict(d.payment_gate ?? d.payment);
  const pkg = asDict(d.package);
  const requestId = asStr(d.checkout_request_id ?? d.request_id ?? gate.id);
  const status = asStr(d.promotion_status ?? d.status).toLowerCase();
  const activated = d.payment_required === false || /^(active|activated|approved|paid)$/.test(status);
  const sent = gate.telegram_sent === true || d.telegram_sent === true || status.startsWith("pending") || (d.payment_required === true && !!requestId && gate.telegram_sent !== false && d.telegram_sent !== false);
  return {
    requestId,
    workId: asStr(d.work_id ?? gate.work_id),
    amount: uzs(gate, "amount") || uzs(d, "amount") || uzs(pkg, "price"),
    currency: asStr(gate.currency ?? d.currency ?? pkg.currency, "UZS") || "UZS",
    telegramSent: !activated && sent,
    activated,
  };
}

export function normCatalog(v: unknown, only?: Placement): Catalog {
  const d = asDict(v);
  const status = (x: unknown) => asStr(asDict(x).status).toLowerCase();
  const raw = asArr(Array.isArray(v) ? v : (d.items ?? d.packages)).filter((x) => !status(x) || status(x) === "active");
  const items = raw.map(normPackage).filter((p) => p.id && (!only || p.placement === only));
  const placements = asArr(d.placements).map(normPlacement);
  return { items: items.sort((a, b) => a.price - b.price || a.days - b.days), placements };
}
