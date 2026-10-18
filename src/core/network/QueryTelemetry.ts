import type { QueryClient } from "@tanstack/react-query";
import { track } from "@/shared/analytics";
import { latencyBucket } from "@/shared/analytics/buckets";
import { ApiError, onRoundTrip } from "@/shared/api";
import { noteLatency, probeHealth, useNetStore } from "@/shared/network";

// Watches every query round-trip: samples API latency buckets for analytics (the slow-link detector is fed by
// single request round-trips from the http layer), and after three network failures in a row asks GET /health whether the server is down.
export function startQueryTelemetry(qc: QueryClient): () => void {
  onRoundTrip(noteLatency);
  const began = new Map<string, number>();
  let netFails = 0;
  const stop = qc.getQueryCache().subscribe((e) => {
    if (e.type !== "updated") return;
    const id = e.query.queryHash;
    const a = e.action.type;
    if (a === "fetch") {
      began.set(id, Date.now());
      return;
    }
    if (a !== "success" && a !== "error") return;
    const t0 = began.get(id);
    began.delete(id);
    const ms = t0 === undefined ? 0 : Date.now() - t0;
    if (a === "success") {
      netFails = 0;
    } else if (e.action.type === "error" && e.action.error instanceof ApiError && e.action.error.status === 0) {
      netFails += 1;
      if (netFails >= 3 && useNetStore.getState().online) void probeHealth();
    }
    if (ms >= 1000 || a === "error" || Math.random() < 0.1) track("api_latency", { kind: String(e.query.queryKey[0] ?? "q"), latency: latencyBucket(ms), ok: a === "success" });
  });
  return () => { stop(); onRoundTrip(null); };
}
