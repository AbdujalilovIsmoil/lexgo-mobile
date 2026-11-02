import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { Bbox, MapConfig } from "@/entities/market-map";
import { mapHtml } from "./mapHtml";

export type MapPoint = { id: string; kind: "seller" | "cluster"; lat: number; lon: number; title: string; count?: number; verified?: boolean; bbox?: [number, number, number, number] | null };
export type YandexMapHandle = { center: (lon: number, lat: number, zoom?: number) => void; fit: (pts: [number, number][]) => void };
type Props = {
  config: MapConfig;
  points: MapPoint[];
  selected?: string | null;
  me?: { lat: number; lon: number } | null;
  pickPoint?: { lat: number; lon: number } | null;
  pick?: boolean; // tap on the map chooses a point (manual location / office)
  onBounds?: (bbox: Bbox, zoom: number) => void;
  onMarker?: (id: string) => void;
  onPick?: (p: { lat: number; lon: number }) => void;
  onError?: () => void;
  height?: number;
};

// The site the browser key of the Yandex JS API is issued for: the map page runs as if it were served from it.
const BASE = "https://lexgo.uz/";
const js = (fn: string, ...args: unknown[]) => `window.lexgo&&window.lexgo.${fn}(${args.map((a) => JSON.stringify(a ?? null)).join(",")});true;`;

// Yandex Maps in a WebView (no native SDK): markers / clusters / the user's own point / a picked point come from React, taps and the
// visible area go back. The page never navigates anywhere else; a failure to load reports onError so the screen can fall back to a list.
export const YandexMap = forwardRef<YandexMapHandle, Props>(function YandexMap({ config, points, selected, me, pickPoint, pick, onBounds, onMarker, onPick, onError, height }, ref) {
  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  // The page is built once per config: switching pick mode, markers or points never reloads the map (it would lose its view and markers).
  const html = useMemo(() => mapHtml({ loaderUrl: config.loaderUrl, center: config.center, zoom: config.zoom, debounceMs: config.debounceMs }), [config.loaderUrl, config.center, config.zoom, config.debounceMs]);
  const run = (code: string) => web.current?.injectJavaScript(code);
  useImperativeHandle(ref, () => ({ center: (lon, lat, zoom) => run(js("center", lon, lat, zoom)), fit: (pts) => run(js("fit", pts)) }), []);
  useEffect(() => { if (ready) run(js("setMarkers", points, selected ?? null)); }, [ready, points, selected]);
  useEffect(() => { if (ready) run(js("setMe", me ?? null)); }, [ready, me]);
  useEffect(() => { if (ready) run(js("setPick", pickPoint ?? null)); }, [ready, pickPoint]);
  useEffect(() => { if (ready) run(js("setPickMode", !!pick)); }, [ready, pick]);
  const onMessage = (e: WebViewMessageEvent) => {
    let m: { type?: string; bbox?: number[]; zoom?: number; id?: string; lat?: number; lon?: number };
    try { m = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (m.type === "ready") setReady(true);
    else if (m.type === "bounds" && m.bbox?.length === 4) onBounds?.(m.bbox as Bbox, m.zoom ?? config.zoom);
    else if (m.type === "marker" && m.id) onMarker?.(m.id);
    else if (m.type === "pick" && typeof m.lat === "number" && typeof m.lon === "number") onPick?.({ lat: m.lat, lon: m.lon });
    else if (m.type === "error") onError?.();
  };
  return (
    <View style={[s.box, height ? { height } : s.fill]}>
      <WebView
        ref={web}
        source={{ html, baseUrl: BASE }}
        originWhitelist={["https://*", "about:*"]}
        onShouldStartLoadWithRequest={(r) => r.url === BASE || r.url.startsWith("about:") || r.url.startsWith("data:")}
        setSupportMultipleWindows={false}
        onMessage={onMessage}
        onLoadStart={() => setReady(false)} // a reload (e.g. the OS killed the renderer) draws everything again once the new page is ready
        onRenderProcessGone={() => { setReady(false); web.current?.reload(); }}
        onError={() => onError?.()}
        onHttpError={(e) => { if (e.nativeEvent.url === BASE) onError?.(); }}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled={false}
        cacheEnabled
        style={s.fill}
        androidLayerType="hardware"
        nestedScrollEnabled
      />
    </View>
  );
});

const s = StyleSheet.create({ box: { overflow: "hidden", backgroundColor: "#E8EEF6" }, fill: { flex: 1 } });
