import { ApiError } from "@/shared/api";
import { isConsentRequired, isGeocoderDown, isNavUnavailable, mapErrorKey } from "../lib/errors";
import { navCandidates, openNavigation } from "../lib/openNav";
import { nearbyBody } from "./mapApi";
import { normConfig, normConsent, normGeo, normNavigation, normNearby, normOffice, normSeller, normViewport } from "./norm";

describe("market map: config", () => {
  it("reads the production config shape", () => {
    const c = normConfig({
      configured: true, maps_loader_url: "https://api-maps.yandex.ru/2.1/?apikey=k&lang=uz_UZ", geocoder_configured: true,
      default_location: { center: [69.2401, 41.2995], zoom: 11 }, viewport_debounce_ms: 400, accuracy_warning_threshold_meters: 500,
      consent_policy: { allowed_duration_hours: [1, 24, 168, 720], default_duration_hours: 24 },
      realtime: { subscribe_event: "marketplace.map.subscribe", unsubscribe_event: "marketplace.map.unsubscribe", update_event: "marketplace.seller_location_updated" },
    });
    expect(c).toMatchObject({ configured: true, center: [69.2401, 41.2995], zoom: 11, debounceMs: 400, accuracyWarnM: 500, consentDurations: [1, 24, 168, 720], consentDefault: 24 });
    expect(c.realtime.update).toBe("marketplace.seller_location_updated");
  });
  it("is not configured without a loader and falls back to Tashkent", () => {
    const c = normConfig({ configured: true });
    expect(c.configured).toBe(false);
    expect(c.center).toEqual([69.2401, 41.2995]);
    expect(c.consentDurations).toEqual([24]);
  });
});

describe("market map: sellers", () => {
  const item = { seller_user_id: "s1", public_id: "LGA-1", display_name: "A. Karimov", seller_type: "advokat", distance_km: 2.4, latitude: 41.3, longitude: 69.24, location_precision: "approximate_50m", rating: 4.8, reviews_count: 25, is_verified: true, navigation: { available: false }, service_action: { id: "svc", title: "Konsultatsiya", price: 879749, currency: "UZS", can_purchase: true, purchase_url: "/x" } };
  it("reads a nearby item, its service action and navigation flag", () => {
    const s = normSeller(item)!;
    expect(s).toMatchObject({ id: "s1", name: "A. Karimov", distanceKm: 2.4, lat: 41.3, lon: 69.24, verified: true, navigable: false });
    expect(s.service).toMatchObject({ id: "svc", price: 879749, canPurchase: true });
  });
  it("reads [longitude, latitude] marker coordinates in that order", () => {
    const s = normSeller({ seller_user_id: "s2", coordinates: [69.1, 41.2] })!;
    expect([s.lon, s.lat]).toEqual([69.1, 41.2]);
  });
  it("drops items without an id or a coordinate", () => {
    expect(normSeller({ display_name: "x", latitude: 1, longitude: 2 })).toBeNull();
    expect(normSeller({ seller_user_id: "x" })).toBeNull();
  });
  it("reads the nearby result with fallback and accuracy flags", () => {
    const r = normNearby({ items: [item, { bad: true }], radius_km: 10, fallback_nearest: true, accuracy_warning: true });
    expect(r.items).toHaveLength(1);
    expect(r).toMatchObject({ radiusKm: 10, fallbackNearest: true, accuracyWarning: true });
  });
  it("splits viewport markers from clusters", () => {
    const v = normViewport({ markers: [{ ...item, seller_user_id: "m1" }, { type: "cluster", count: 7, coordinates: [69.3, 41.3], bbox: [69.2, 41.2, 69.4, 41.4] }], total_in_bbox: 8, truncated: false });
    expect(v.sellers.map((x) => x.id)).toEqual(["m1"]);
    expect(v.clusters).toEqual([{ id: "c:69.3000,41.3000", lat: 41.3, lon: 69.3, count: 7, bbox: [69.2, 41.2, 69.4, 41.4] }]);
    expect(v.total).toBe(8);
  });
});

describe("market map: consent, geocoder, navigation, office", () => {
  it("reads consent from the root or a nested consent object", () => {
    expect(normConsent({ granted: true, permission_state: "granted", source: "android", duration_hours: 24 })).toMatchObject({ granted: true, state: "granted", durationHours: 24 });
    expect(normConsent({ consent: { granted: false, permission_state: "denied" } })).toMatchObject({ granted: false, state: "denied" });
    expect(normConsent({ permission_state: "weird" }).state).toBe("");
  });
  it("reads geocoder items", () => {
    expect(normGeo({ items: [{ id: "1", name: "Amir Temur", formatted_address: "Toshkent, Amir Temur 1", latitude: 41.3, longitude: 69.2, precision: "exact" }] })[0]).toMatchObject({ address: "Toshkent, Amir Temur 1", lat: 41.3, lon: 69.2 });
    expect(normGeo([{ name: "x" }])).toEqual([]);
  });
  it("reads the navigation urls", () => {
    expect(normNavigation({ app_url: "yandexmaps://a", app_urls: { yandex_maps: "yandexmaps://a", yandex_navigator: "yandexnavi://b" }, fallback_url: "https://yandex.com/maps/c", destination_source: "public_office" })).toMatchObject({ navigatorUrl: "yandexnavi://b", mapsUrl: "yandexmaps://a", fallbackUrl: "https://yandex.com/maps/c" });
  });
  it("reads the office or null", () => {
    expect(normOffice({ latitude: 41.3, longitude: 69.2, formatted_address: "Toshkent", public_navigation_enabled: true })).toEqual({ lat: 41.3, lon: 69.2, address: "Toshkent", publicNavigation: true });
    expect(normOffice({ office: null })).toBeNull();
  });
});

describe("market map: errors", () => {
  const err = (status: number, code?: string) => new ApiError(status, undefined, { code });
  it("maps every contract code to its own text and unknown ones to a safe text", () => {
    expect(mapErrorKey(err(403, "client_location_consent_required"))).toBe("mmap.err.client_location_consent_required");
    expect(mapErrorKey(err(422, "radius_invalid"))).toBe("mmap.err.radius_invalid");
    expect(mapErrorKey(err(500, "some_internal_code"))).toBe("mmap.err.generic");
    expect(mapErrorKey(err(0))).toBe("mmap.err.offline");
    expect(mapErrorKey(new Error("x"))).toBe("mmap.err.generic");
  });
  it("tells the flows apart", () => {
    expect(isConsentRequired(err(403, "client_location_consent_required"))).toBe(true);
    expect(isNavUnavailable(err(403, "navigation_destination_unavailable"))).toBe(true);
    expect(isNavUnavailable(err(409, "active_paid_order_required"))).toBe(true);
    expect(isGeocoderDown(err(503, "yandex_geocoder_unavailable"))).toBe(true);
    expect(isGeocoderDown(err(429))).toBe(true);
  });
});

describe("market map: opening a route", () => {
  const nav = { appUrl: "yandexmaps://a", navigatorUrl: "yandexnavi://b", mapsUrl: "yandexmaps://a", fallbackUrl: "https://yandex.com/maps/c", destinationSource: "", name: "" };
  it("tries the navigator for driving, then maps, then the web", () => {
    expect(navCandidates(nav, "driving")).toEqual(["yandexnavi://b", "yandexmaps://a", "https://yandex.com/maps/c"]);
    expect(navCandidates(nav, "walking")).toEqual(["yandexmaps://a", "https://yandex.com/maps/c"]);
  });
  it("falls back to the browser when no Yandex app opens", async () => {
    const tried: string[] = [];
    const used = await openNavigation(nav, "driving", async (u) => { tried.push(u); if (!u.startsWith("https")) throw new Error("no app"); });
    expect(used).toBe("https://yandex.com/maps/c");
    expect(tried).toHaveLength(3);
  });
  it("fails when nothing can open", async () => {
    await expect(openNavigation(nav, "transit", async () => { throw new Error("no"); })).rejects.toThrow("navigation_unavailable");
  });
});

describe("market map: nearby body", () => {
  it("leaves out empty fields (a picked point has no accuracy)", () => {
    const b = nearbyBody({ latitude: 41.3, longitude: 69.2, accuracy_meters: null, radius_km: 10, service_id: null, category_id: null, subcategory_id: null, seller_type: null, minimum_rating: 0, verified_only: true, sort: "nearest", limit: 50 });
    expect(b).toEqual({ latitude: 41.3, longitude: 69.2, radius_km: 10, minimum_rating: 0, verified_only: true, sort: "nearest", limit: 50 });
  });
});
