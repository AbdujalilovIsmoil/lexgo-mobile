import { useEffect, useRef } from "react";
import type { MapConfig } from "@/entities/market-map";
import { sendUserEvent, useResync, useSocketState, useUserEvents } from "@/shared/realtime";

// While a map screen is open: subscribe to seller location updates (marketplace.map.subscribe), refetch the visible area / list on
// marketplace.seller_location_updated (debounced — a busy city sends many), subscribe again and refresh once after a reconnect, and
// unsubscribe on leaving. The update itself is never trusted as a coordinate: `refresh` refetches through the authorized API.
export function useMapRealtime(cfg: MapConfig | undefined, refresh: () => void, debounceMs = 1500) {
  const online = useSocketState() === "online";
  const cb = useRef(refresh);
  useEffect(() => { cb.current = refresh; });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sub = cfg?.realtime.subscribe ?? "marketplace.map.subscribe";
  const unsub = cfg?.realtime.unsubscribe ?? "marketplace.map.unsubscribe";
  const update = cfg?.realtime.update ?? "marketplace.seller_location_updated";

  useEffect(() => {
    if (!online) return;
    sendUserEvent({ event: sub });
    return () => { sendUserEvent({ event: unsub }); };
  }, [online, sub, unsub]);

  useResync(() => {
    sendUserEvent({ event: sub });
    cb.current();
  });

  useUserEvents(update, () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb.current(), debounceMs);
  });

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
}
