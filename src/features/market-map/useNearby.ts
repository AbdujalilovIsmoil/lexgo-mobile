import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isConsentRequired, searchNearby, sellersInBbox, useConsent, useMapConfig, useSaveConsent, type Bbox, type NearbySort, type Radius, type SellerType } from "@/entities/market-map";
import { askLocationPermission, currentFix } from "@/shared/lib/geo/deviceLocation";

export type Origin = { lat: number; lon: number; accuracy: number | null; manual: boolean };
export type Phase = "intro" | "locating" | "denied" | "ready";
export type Filters = { radius: Radius; sellerType: SellerType | null; sort: NearbySort; verifiedOnly: boolean; categoryId: string | null; minRating: number };
export const DEFAULT_FILTERS: Filters = { radius: 10, sellerType: null, sort: "nearest", verifiedOnly: true, categoryId: null, minRating: 0 };

const SOURCE = Platform.OS === "ios" ? "ios" : "android";

// The client's "specialists near me": the OS permission is asked only on the user's tap, its result is recorded as LexGo consent
// (android / ios, or manual for a point picked on the map), one fix is read and the nearby search runs. The coordinate lives in this
// screen's memory only (react-query keeps it in memory under a key that is never persisted, see queryPersist). The visible map area
// shows the public, approximate markers (GET /marketplace/sellers/map).
export function useNearby() {
  const cfg = useMapConfig().data;
  const consent = useConsent();
  const save = useSaveConsent();
  const [phase, setPhase] = useState<Phase>("intro");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [precise, setPrecise] = useState<boolean | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<{ bbox: Bbox; zoom: number } | null>(null);
  const [locError, setLocError] = useState<string>("");
  const busy = useRef(false);
  const duration = cfg?.consentDefault ?? 24;

  const record = (granted: boolean, state: "granted" | "denied" | "unavailable", source: "android" | "ios" | "manual") =>
    save.mutateAsync({ granted, state, source, durationHours: granted ? duration : null }).catch(() => undefined);

  // The tap on "show specialists near me".
  const locate = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setLocError("");
    setPhase("locating");
    try {
      const perm = await askLocationPermission();
      setPrecise(perm.precise);
      if (perm.status !== "granted") {
        await record(false, "denied", SOURCE);
        setPhase("denied");
        return;
      }
      await record(true, "granted", SOURCE);
      const fix = await currentFix();
      setOrigin({ lat: fix.latitude, lon: fix.longitude, accuracy: fix.accuracy, manual: false });
      setPhase("ready");
    } catch {
      setLocError("mmap.err.location");
      setPhase("denied");
    } finally {
      busy.current = false;
    }
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  // A point picked on the map instead of the device location.
  const pickManual = useCallback(async (p: { lat: number; lon: number }) => {
    await record(true, "granted", "manual");
    setOrigin({ lat: p.lat, lon: p.lon, accuracy: null, manual: true });
    setPhase("ready");
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const revoke = useCallback(async () => {
    await record(false, "denied", origin?.manual ? "manual" : SOURCE);
    setOrigin(null);
    setPhase("intro");
  }, [origin?.manual]); // eslint-disable-line react-hooks/exhaustive-deps

  const nearby = useQuery({
    queryKey: ["market-map", "nearby", origin, filters],
    enabled: !!origin,
    gcTime: 60_000,
    retry: (n, e) => !isConsentRequired(e) && n < 1,
    queryFn: () => searchNearby({
      latitude: origin!.lat, longitude: origin!.lon, accuracy_meters: origin!.accuracy !== null ? Math.round(origin!.accuracy) : null,
      radius_km: filters.radius, service_id: null, category_id: filters.categoryId, subcategory_id: null, seller_type: filters.sellerType,
      minimum_rating: filters.minRating, verified_only: filters.verifiedOnly, sort: filters.sort, limit: 50,
    }),
  });

  const viewport = useQuery({
    queryKey: ["market-map", "bbox", view, filters.sellerType, filters.categoryId, filters.verifiedOnly, filters.minRating],
    enabled: !!view,
    gcTime: 60_000,
    placeholderData: keepPreviousData, // keep the markers while the next area loads (a newer area replaces an older request's result)
    queryFn: () => sellersInBbox(view!.bbox, view!.zoom, { categoryId: filters.categoryId, sellerType: filters.sellerType, verifiedOnly: filters.verifiedOnly, minimumRating: filters.minRating }),
  });

  const lowAccuracy = !!origin && !origin.manual && ((origin.accuracy ?? 0) > (cfg?.accuracyWarnM ?? 500) || nearby.data?.accuracyWarning === true);
  const refresh = useCallback(() => { void nearby.refetch(); void viewport.refetch(); }, [nearby, viewport]);

  return { cfg, consent: consent.data, phase, setPhase, origin, precise, filters, setFilters, setView, nearby, viewport, locate, pickManual, revoke, lowAccuracy, locError, refresh, consentRequired: isConsentRequired(nearby.error) };
}
