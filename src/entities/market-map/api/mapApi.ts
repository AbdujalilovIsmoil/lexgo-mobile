import { http } from "@/shared/api";
import type { Bbox, ConsentSource, NavMode, NearbyQuery, PermissionState } from "../model/types";
import { normConfig, normConsent, normGeo, normNavigation, normNearby, normOffice, normViewport } from "./norm";

const enc = encodeURIComponent;
const q = (o: Record<string, string | number | boolean | null | undefined>) =>
  Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => `${k}=${enc(String(v))}`).join("&");

// GET /marketplace/map/config — cached for the session by the query layer.
export const getMapConfig = async () => normConfig(await http("/marketplace/map/config", { auth: false }));

// GET /marketplace/map/provider-health — diagnostics only (when the map fails to load).
export const getProviderHealth = async () => http("/marketplace/map/provider-health", { auth: false });

// GET / POST /marketplace/me/location-consent
export const getConsent = async () => normConsent(await http("/marketplace/me/location-consent"));
export const saveConsent = async (b: { granted: boolean; state: PermissionState; source: ConsentSource; durationHours: number | null }) =>
  normConsent(await http("/marketplace/me/location-consent", { method: "POST", body: { granted: b.granted, permission_state: b.state, source: b.source, duration_hours: b.granted ? b.durationHours : null } }));

// POST /marketplace/nearby-sellers/search — the client's coordinate is used for this search only (the backend does not persist it).
// Fields with no value are left out (the backend validates them as numbers / ids when present): a point picked on the map has no accuracy.
export const nearbyBody = (b: NearbyQuery): Record<string, unknown> => Object.fromEntries(Object.entries(b).filter(([, v]) => v !== null && v !== undefined && v !== ""));
export const searchNearby = async (body: NearbyQuery) => normNearby(await http("/marketplace/nearby-sellers/search", { method: "POST", body: nearbyBody(body) }));

// GET /marketplace/sellers/map?bbox=minLon,minLat,maxLon,maxLat — public, approximate markers and clusters of the visible area.
export async function sellersInBbox(bbox: Bbox, zoom: number, f: { serviceId?: string | null; categoryId?: string | null; sellerType?: string | null; minimumRating?: number; verifiedOnly?: boolean; limit?: number } = {}) {
  const query = q({ bbox: bbox.map((x) => x.toFixed(5)).join(","), zoom: Math.round(zoom), service_id: f.serviceId, category_id: f.categoryId, seller_type: f.sellerType, minimum_rating: f.minimumRating || null, verified_only: f.verifiedOnly ?? true, limit: f.limit ?? 300 });
  return normViewport(await http(`/marketplace/sellers/map?${query}`));
}

// GET /marketplace/geocoder/search | reverse
export const geocodeSearch = async (text: string, lang: string) => normGeo(await http(`/marketplace/geocoder/search?${q({ q: text, country: "UZ", lang, limit: 7 })}`));
export const geocodeReverse = async (lat: number, lon: number, lang: string) => normGeo(await http(`/marketplace/geocoder/reverse?${q({ latitude: lat, longitude: lon, lang })}`));

// POST /marketplace/sellers/{id}/navigation — the only way to get a route: never built from marker coordinates.
export const requestNavigation = async (sellerId: string, b: { latitude: number; longitude: number; mode: NavMode; paidOrderId?: string | null }) =>
  normNavigation(await http(`/marketplace/sellers/${enc(sellerId)}/navigation`, { method: "POST", body: { latitude: b.latitude, longitude: b.longitude, mode: b.mode, paid_order_id: b.paidOrderId ?? null } }));

// GET / PUT / DELETE /marketplace/me/office-location (sellers)
export const getOffice = async () => normOffice(await http("/marketplace/me/office-location"));
export const putOffice = async (b: { lat: number; lon: number; address: string; publicNavigation: boolean }) =>
  normOffice(await http("/marketplace/me/office-location", { method: "PUT", body: { latitude: b.lat, longitude: b.lon, formatted_address: b.address, public_navigation_enabled: b.publicNavigation } }));
export const deleteOffice = async () => { await http("/marketplace/me/office-location", { method: "DELETE" }); };

// Yandex geocoder language for the app locale.
export const geoLang = (locale: string) => (locale === "ru" ? "ru_RU" : locale === "en" ? "en_RU" : "uz_UZ");
