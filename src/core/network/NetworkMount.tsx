import { useEffect } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { flushOutbox } from "@/shared/cache";
import { OfflineBanner, onBackOnline, probeHealth, startNetworkMonitor } from "@/shared/network";
import { kickUserSocket } from "@/shared/realtime";
import { track } from "@/shared/analytics";
import { startQueryTelemetry } from "./QueryTelemetry";

// NetworkMonitor: connectivity → react-query's onlineManager (queries pause offline and resume on
// return), socket kick, outbox flush, reachability probe. Mutations never wait for a connection:
// "always" makes them fail at once instead of silently replaying later (a payment must not fire
// minutes after the tap); only the explicit outbox (idempotent drafts) is deferred.
export function NetworkMount() {
  const qc = useQueryClient();
  useEffect(() => {
    const d = qc.getDefaultOptions();
    qc.setDefaultOptions({ ...d, mutations: { ...d.mutations, networkMode: "always" } });
    const stopNet = startNetworkMonitor();
    const stopTelemetry = startQueryTelemetry(qc);
    const off = onBackOnline(() => {
      track("network_change", { online: true });
      kickUserSocket();
      void probeHealth();
      void flushOutbox();
    });
    void probeHealth();
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") return;
      void flushOutbox();
      void probeHealth();
    });
    return () => {
      stopNet();
      stopTelemetry();
      off();
      sub.remove();
    };
  }, [qc]);
  return <OfflineBanner />;
}
