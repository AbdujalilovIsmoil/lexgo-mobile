import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { flushOutbox, onFlushed } from "@/shared/cache";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { OfflineBanner, onBackOnline, probeHealth, recheckNetwork, startNetworkMonitor } from "@/shared/network";
import { kickUserSocket } from "@/shared/realtime";
import { track } from "@/shared/analytics";
import { startSoftOffline } from "./softOffline";
import { startQueryTelemetry } from "./QueryTelemetry";

// NetworkMonitor: connectivity → react-query's onlineManager (queries pause offline and resume on
// return), socket kick, outbox flush, reachability probe. Mutations never wait for a connection:
// "always" makes them fail at once instead of silently replaying later (a payment must not fire
// minutes after the tap); only the explicit outbox (idempotent drafts) is deferred.
export function NetworkMount() {
  const qc = useQueryClient();
  const { t } = useT();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  useEffect(() => {
    const d = qc.getDefaultOptions();
    qc.setDefaultOptions({ ...d, mutations: { ...d.mutations, networkMode: "always" } });
    const stopNet = startNetworkMonitor();
    // After queued writes were sent (or rejected) reload what they touched, and tell the user about rejected ones.
    const stopFlush = onFlushed((r) => {
      for (const key of r.keys) void qc.invalidateQueries({ queryKey: [...key] });
      if (r.dropped > 0) toast(tRef.current("nt3.net.syncFailed", { n: r.dropped }), "err");
    });
    const stopTelemetry = startQueryTelemetry(qc);
    const stopSoft = startSoftOffline(qc);
    const off = onBackOnline(() => {
      track("network_change", { online: true });
      kickUserSocket();
      void probeHealth();
      void flushOutbox();
    });
    void probeHealth();
    // Items waiting out a retry delay are picked up by this slow tick (a flush with nothing due is one cheap query).
    const tick = setInterval(() => void flushOutbox(), 30_000);
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") return;
      void recheckNetwork();
      void flushOutbox();
      void probeHealth();
    });
    return () => {
      stopNet();
      stopFlush();
      stopTelemetry();
      stopSoft();
      off();
      sub.remove();
      clearInterval(tick);
    };
  }, [qc]);
  return <OfflineBanner />;
}
