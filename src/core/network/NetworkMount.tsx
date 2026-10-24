import { useEffect, useRef } from "react";
import { AppState, Linking, Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { flushOutbox, onFlushed } from "@/shared/cache";
import { useT } from "@/shared/i18n";
import { confirmDialog, toast } from "@/shared/ui";
import { useDialogStore, type DialogSpec } from "@/shared/ui/dialog";
import { OfflineBanner, onBackOnline, probeHealth, recheckNetwork, startNetworkMonitor, useNetStore } from "@/shared/network";
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
    // While the banner says "server not answering", look again every few seconds so it goes away by itself.
    const heal = setInterval(() => { if (useNetStore.getState().serverDown) void probeHealth(); }, 8_000);
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
      clearInterval(heal);
    };
  }, [qc]);
  useDeniedNotice();
  return <OfflineBanner />;
}

// The phone has a network but does not let LexGo use it (iOS: Mobile Data / Wireless Data off for the app; Android: a per-app data
// restriction). "No internet" would send the person looking in the wrong place, so once per launch the app says what is off and opens
// its own page in the system settings, where the switch is. When the internet comes back while it is still open, it closes itself.
function useDeniedNotice(): void {
  const { t } = useT();
  const denied = useNetStore((s) => s.cause === "denied");
  const told = useRef(false);
  const open = useRef<DialogSpec | null>(null);
  useEffect(() => {
    if (!denied) {
      if (open.current && useDialogStore.getState().spec === open.current) useDialogStore.getState().close();
      open.current = null;
      return;
    }
    if (told.current) return;
    told.current = true;
    const spec: DialogSpec = {
      title: t("nt3.denied.title"),
      message: t(Platform.OS === "ios" ? "nt3.denied.ios" : "nt3.denied.android"),
      confirmLabel: t("nt3.denied.open"),
      cancelLabel: t("nt3.denied.later"),
      icon: "wifi-off",
      confirmIcon: "settings",
      onConfirm: () => void Linking.openSettings().catch(() => undefined),
    };
    open.current = spec;
    confirmDialog(spec);
  }, [denied, t]);
}
