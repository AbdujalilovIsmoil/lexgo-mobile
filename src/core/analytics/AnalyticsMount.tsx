import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useSegments } from "expo-router";
import { crumb, latencyBucket, loadAnalyticsEnabled, track, trackScreen } from "@/shared/analytics";
import { useResync, useSocketState } from "@/shared/realtime";

// AnalyticsClient wiring: screen views from the router (route PATTERNS like chat/[roomId], never the
// ids), websocket reconnects with how long the link was down, app state crumbs, and a crash
// breadcrumb that records only the error NAME of an uncaught exception.
export function AnalyticsMount() {
  const segments = useSegments();
  const screen = segments.length ? segments.join("/") : "index";
  useEffect(() => {
    trackScreen(screen);
    crumb(`screen:${screen}`);
  }, [screen]);

  useEffect(() => {
    void loadAnalyticsEnabled();
    const prev = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, fatal) => {
      crumb(`${fatal ? "fatal" : "error"}:${error instanceof Error ? error.name : "unknown"}`);
      prev(error, fatal);
    });
    const sub = AppState.addEventListener("change", (s) => crumb(`app:${s}`));
    return () => {
      ErrorUtils.setGlobalHandler(prev);
      sub.remove();
    };
  }, []);

  const socket = useSocketState();
  const downAt = useRef(0);
  useEffect(() => {
    if (socket === "offline" && !downAt.current) downAt.current = Date.now();
    else if (socket === "online") downAt.current = 0;
  }, [socket]);
  useResync(() => {
    track("ws_reconnect", { attempt: 1, latency: latencyBucket(downAt.current ? Date.now() - downAt.current : 0) });
    downAt.current = 0;
  });
  return null;
}
