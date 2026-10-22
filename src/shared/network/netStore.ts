import { create } from "zustand";

export type NetKind = "none" | "wifi" | "cellular" | "other";
// Why `online` is false: the phone has no usable network, or it has one but the OS does not let LexGo use it (Mobile Data /
// Wireless Data switched off for the app, a per-app restriction). "" while online.
export type OfflineCause = "" | "no_network" | "denied";
type NetState = {
  online: boolean; // the device says it is connected and the internet is reachable
  kind: NetKind;
  slow: boolean; // recent API calls are slow (latency.ts)
  serverDown: boolean; // online, but GET /health fails (health.ts)
  offlineSince: number; // epoch ms, 0 while online
  restoredAt: number; // epoch ms of the last offline → online change (drives the "back online" flash)
  skewMs: number; // server clock minus device clock (for countdowns from server timestamps)
  cause: OfflineCause;
  detail: string; // while offline: what the OS reported and why our own request failed (settings → connection)
};

// Connectivity as the whole app sees it. Written by NetworkMonitor / latency / health only.
export const useNetStore = create<NetState>(() => ({ online: true, kind: "other", slow: false, serverDown: false, offlineSince: 0, restoredAt: 0, skewMs: 0, cause: "", detail: "" }));

export const isOnline = (): boolean => useNetStore.getState().online;
// Server "now" in epoch ms: use it instead of Date.now() when a deadline comes from the backend.
export const serverNow = (): number => Date.now() + useNetStore.getState().skewMs;
