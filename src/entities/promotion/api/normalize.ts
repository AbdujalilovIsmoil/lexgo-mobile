import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { PLACEMENTS, type Catalog, type Placement, type PlacementOption, type PromoPackage } from "../model/types";

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

export function normCatalog(v: unknown): Catalog {
  const d = asDict(v);
  const items = asArr(Array.isArray(v) ? v : (d.items ?? d.packages)).map(normPackage).filter((p) => p.id);
  const placements = asArr(d.placements).map(normPlacement);
  return { items: items.sort((a, b) => a.price - b.price || a.days - b.days), placements };
}
