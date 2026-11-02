// Marketplace Yandex Maps contract (backend b448ab3): map config, client location consent, nearby search, viewport markers, geocoder,
// authorized navigation and the seller's office. Input coordinates are latitude / longitude fields; coordinate arrays the backend returns
// for drawing are [longitude, latitude].

export type LonLat = [number, number];

export type MapConfig = {
  configured: boolean;
  loaderUrl: string; // Yandex Maps JS API 2.1 loader with the key (rendered in a WebView)
  geocoder: boolean;
  center: LonLat;
  zoom: number;
  debounceMs: number;
  accuracyWarnM: number;
  consentDurations: number[]; // allowed duration_hours for the client's consent
  consentDefault: number;
  realtime: { subscribe: string; unsubscribe: string; update: string };
};

export type ConsentSource = "android" | "ios" | "manual" | "web";
export type PermissionState = "granted" | "denied" | "prompt" | "unavailable";
export type Consent = { granted: boolean; state: PermissionState | ""; source: string; expiresAt: string; durationHours: number | null };

export type SellerType = "advokat" | "yurist" | "advokat_tashkiloti";
export type NearbySort = "nearest" | "rating" | "recommended";
export const RADII = [5, 10, 25, 50] as const;
export type Radius = (typeof RADII)[number];

export type NearbyQuery = {
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  radius_km: Radius;
  service_id: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  seller_type: SellerType | null;
  minimum_rating: number;
  verified_only: boolean;
  sort: NearbySort;
  limit: number;
  paid_order_id?: string | null;
};

export type ServiceAction = { id: string; title: string; price: number; currency: string; canPurchase: boolean; purchaseUrl: string };

// One specialist on the map or in the list. Coordinates are APPROXIMATE (≈50 m nearby, ≈500 m on public markers): never an exact address.
export type MapSeller = {
  id: string; // seller_user_id
  publicId: string;
  name: string;
  type: string;
  distanceKm: number | null;
  lat: number;
  lon: number;
  precision: string; // approximate_50m | approximate_500m | exact …
  source: string; // live | office …
  rating: number;
  reviews: number;
  verified: boolean;
  region: string;
  district: string;
  lastSeenAt: string;
  avatar: string;
  service: ServiceAction | null;
  navigable: boolean | null; // backend navigation.available, null when not told
};

export type NearbyResult = { items: MapSeller[]; radiusKm: number; fallbackNearest: boolean; accuracyWarning: boolean };

export type Cluster = { id: string; lat: number; lon: number; count: number; bbox: [number, number, number, number] | null };
export type ViewportResult = { sellers: MapSeller[]; clusters: Cluster[]; total: number; truncated: boolean };
export type Bbox = [number, number, number, number]; // minLon, minLat, maxLon, maxLat

export type GeoItem = { id: string; name: string; description: string; address: string; lat: number; lon: number; precision: string };

export type NavMode = "driving" | "walking" | "transit" | "bicycle";
export const NAV_MODES: NavMode[] = ["driving", "walking", "transit", "bicycle"];
export type Navigation = { appUrl: string; navigatorUrl: string; mapsUrl: string; fallbackUrl: string; destinationSource: string; name: string };

export type Office = { lat: number; lon: number; address: string; publicNavigation: boolean } | null;
