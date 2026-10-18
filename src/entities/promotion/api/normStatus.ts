import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Analytics, PromoStatus, Running } from "../model/types";
import { placementOf } from "./normalize";

const daysBetween = (iso: string) => {
  const ms = Date.parse(iso) - Date.now();
  return Number.isFinite(ms) ? Math.max(0, Math.ceil(ms / 86_400_000)) : 0;
};

export function normRunning(v: unknown): Running {
  const d = asDict(v);
  const pkg = asDict(d.package);
  const svc = asDict(d.service);
  const endsAt = asStr(d.ends_at);
  return {
    id: asStr(d.id ?? d.promotion_id),
    placement: placementOf(d.placement ?? pkg.placement),
    packageTitle: asStr(d.package_title ?? pkg.title),
    serviceId: asStr(d.service_id ?? svc.id),
    serviceTitle: asStr(d.service_title ?? svc.title ?? svc.name),
    title: asStr(d.title),
    startsAt: asStr(d.starts_at),
    endsAt,
    daysLeft: d.days_left != null ? asNum(d.days_left) : daysBetween(endsAt),
    price: uzs(pkg, "price") || uzs(d, "price", "amount"),
  };
}

export function normStatus(v: unknown): PromoStatus {
  const d = asDict(v);
  // `items` is the flat list; `by_placement` repeats it per placement (use it when the flat list is missing).
  const grouped = Object.values(asDict(d.by_placement)).flatMap(asArr);
  const seen = new Set<string>();
  const items = [...asArr(d.items), ...grouped].map(normRunning).filter((r) => {
    const key = r.id || `${r.placement}|${r.serviceId}|${r.endsAt}`;
    return !seen.has(key) && !!seen.add(key);
  });
  return { active: d.active === true || items.length > 0, daysLeft: asNum(d.days_left), endsAt: asStr(d.ends_at), items };
}

export function normAnalytics(v: unknown): Analytics {
  const d = asDict(v);
  return {
    impressions: asNum(d.impressions),
    searchAppearances: asNum(d.search_appearances),
    profileClicks: asNum(d.profile_clicks),
    contactRequests: asNum(d.contact_requests),
    series: asArr(d.series).map((x) => {
      const r = asDict(x);
      return { date: asStr(r.date ?? r.day), impressions: asNum(r.impressions), clicks: asNum(r.clicks ?? r.profile_clicks) };
    }),
  };
}
