import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import type { Cluster, Consent, GeoItem, MapConfig, MapSeller, Navigation, NearbyResult, Office, PermissionState, ViewportResult } from "../model/types";

const TASHKENT: [number, number] = [69.2401, 41.2995];
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);

export function normConfig(v: unknown): MapConfig {
  const d = asDict(v);
  const dl = asDict(d.default_location);
  const c = asArr(dl.center).map(num);
  const cp = asDict(d.consent_policy);
  const rt = asDict(d.realtime);
  const durations = asArr(cp.allowed_duration_hours).map(num).filter((x): x is number => x !== null);
  return {
    configured: d.configured === true && !!asStr(d.maps_loader_url),
    loaderUrl: asStr(d.maps_loader_url),
    geocoder: d.geocoder_configured === true,
    center: c.length === 2 && c[0] !== null && c[1] !== null ? [c[0], c[1]] : TASHKENT,
    zoom: asNum(dl.zoom, 11) || 11,
    debounceMs: asNum(d.viewport_debounce_ms, 400) || 400,
    accuracyWarnM: asNum(d.accuracy_warning_threshold_meters, 500) || 500,
    consentDurations: durations.length ? durations : [24],
    consentDefault: num(cp.default_duration_hours) ?? 24,
    realtime: { subscribe: asStr(rt.subscribe_event, "marketplace.map.subscribe"), unsubscribe: asStr(rt.unsubscribe_event, "marketplace.map.unsubscribe"), update: asStr(rt.update_event, "marketplace.seller_location_updated") },
  };
}

const STATES: PermissionState[] = ["granted", "denied", "prompt", "unavailable"];
export function normConsent(v: unknown): Consent {
  const root = asDict(v);
  const d = Object.keys(asDict(root.consent)).length ? asDict(root.consent) : root;
  const state = asStr(d.permission_state);
  const active = d.granted === true || d.active === true || asStr(d.status) === "granted";
  return { granted: active, state: (STATES as string[]).includes(state) ? (state as PermissionState) : "", source: asStr(d.source), expiresAt: asStr(d.expires_at), durationHours: num(d.duration_hours) };
}

function serviceOf(v: unknown): MapSeller["service"] {
  const s = asDict(v);
  if (!asStr(s.id)) return null;
  return { id: asStr(s.id), title: asStr(s.title), price: asNum(s.price), currency: asStr(s.currency, "UZS"), canPurchase: s.can_purchase === true, purchaseUrl: asStr(s.purchase_url) };
}

// A seller from nearby search or a viewport marker. Marker coordinates may come as `coordinates: [lon, lat]` or as latitude / longitude.
export function normSeller(v: unknown): MapSeller | null {
  const d = asDict(v);
  const coords = asArr(d.coordinates ?? asDict(d.location).coordinates).map(num);
  const lat = num(d.latitude) ?? num(asDict(d.location).latitude) ?? (coords.length === 2 ? coords[1] : null);
  const lon = num(d.longitude) ?? num(asDict(d.location).longitude) ?? (coords.length === 2 ? coords[0] : null);
  const id = asStr(d.seller_user_id ?? d.user_id ?? d.id);
  if (!id || lat === null || lon === null) return null;
  const nav = asDict(d.navigation);
  return {
    id, publicId: asStr(d.public_id), name: asStr(d.display_name ?? d.name), type: asStr(d.seller_type),
    distanceKm: num(d.distance_km), lat, lon, precision: asStr(d.location_precision), source: asStr(d.location_source),
    rating: asNum(d.rating), reviews: asNum(d.reviews_count), verified: d.is_verified === true || d.lexgo_verified === true,
    region: asStr(d.region), district: asStr(d.district), lastSeenAt: asStr(d.last_seen_at), avatar: asStr(d.avatar_url ?? d.photo_url),
    service: serviceOf(d.service_action), navigable: typeof nav.available === "boolean" ? nav.available : null,
  };
}

const sellersOf = (list: unknown): MapSeller[] => asArr(list).map(normSeller).filter((x): x is MapSeller => !!x);

export function normNearby(v: unknown): NearbyResult {
  const d = asDict(v);
  return { items: sellersOf(d.items), radiusKm: asNum(d.radius_km), fallbackNearest: d.fallback_nearest === true, accuracyWarning: d.accuracy_warning === true };
}

function clusterOf(v: unknown): Cluster | null {
  const d = asDict(v);
  const coords = asArr(d.coordinates ?? d.center).map(num);
  const lat = num(d.latitude) ?? (coords.length === 2 ? coords[1] : null);
  const lon = num(d.longitude) ?? (coords.length === 2 ? coords[0] : null);
  const count = asNum(d.count ?? d.size);
  if (lat === null || lon === null || count < 2) return null;
  const b = asArr(d.bbox).map(num);
  // The id is made from the position when the backend sends none: stable across refetches of the same area.
  return { id: asStr(d.id, `c:${lon.toFixed(4)},${lat.toFixed(4)}`), lat, lon, count, bbox: b.length === 4 && b.every((x) => x !== null) ? (b as [number, number, number, number]) : null };
}

export function normViewport(v: unknown): ViewportResult {
  const d = asDict(v);
  const raw = asArr(d.markers).length ? asArr(d.markers) : asArr(d.items);
  const isCluster = (x: Dict) => asStr(x.type) === "cluster" || asNum(x.count) > 1 && !asStr(x.seller_user_id);
  const clusters = [...asArr(d.clusters), ...raw.filter((x) => isCluster(asDict(x)))].map((x) => clusterOf(x)).filter((x): x is Cluster => !!x);
  return { sellers: sellersOf(raw.filter((x) => !isCluster(asDict(x)))), clusters, total: asNum(d.total_in_bbox ?? d.count), truncated: d.truncated === true };
}

export function normGeo(v: unknown): GeoItem[] {
  const d = asDict(v);
  const list = Array.isArray(v) ? v : asArr(d.items ?? d.results);
  return list.map((x, i) => {
    const g = asDict(x);
    return { id: asStr(g.id, `g${i}`), name: asStr(g.name), description: asStr(g.description), address: asStr(g.formatted_address ?? g.name), lat: asNum(g.latitude), lon: asNum(g.longitude), precision: asStr(g.precision) };
  }).filter((g) => g.lat || g.lon);
}

export function normNavigation(v: unknown): Navigation {
  const d = asDict(v);
  const urls = asDict(d.app_urls);
  return { appUrl: asStr(d.app_url), navigatorUrl: asStr(urls.yandex_navigator), mapsUrl: asStr(urls.yandex_maps), fallbackUrl: asStr(d.fallback_url ?? d.web_url), destinationSource: asStr(d.destination_source), name: asStr(d.display_name) };
}

export function normOffice(v: unknown): Office {
  const root = asDict(v);
  const d = Object.keys(asDict(root.office)).length ? asDict(root.office) : Object.keys(asDict(root.office_location)).length ? asDict(root.office_location) : root;
  const lat = num(d.latitude);
  const lon = num(d.longitude);
  if (lat === null || lon === null) return null;
  return { lat, lon, address: asStr(d.formatted_address), publicNavigation: d.public_navigation_enabled === true };
}
