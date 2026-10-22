import { Platform } from "react-native";
import { onlineManager } from "@tanstack/react-query";
import { addNetworkStateListener, getNetworkStateAsync, NetworkStateType, type NetworkState } from "expo-network";
import { onReached } from "@/shared/api";
import { netLog } from "./netLog";
import { useNetStore, type NetKind, type OfflineCause } from "./netStore";
import { describeOsPath, isDenied, readOsPath } from "./osPath";
import { probeApi, type Probe } from "./probe";
import { verdictOf } from "./reachability";

const backOnline = new Set<() => void>();

/** Runs `fn` every time the device goes from offline to online (flush the outbox, kick sockets). */
export function onBackOnline(fn: () => void): () => void {
  backOnline.add(fn);
  return () => void backOnline.delete(fn);
}

function kindOf(t?: NetworkStateType): NetKind {
  if (t === NetworkStateType.NONE) return "none";
  if (t === NetworkStateType.WIFI || t === NetworkStateType.ETHERNET) return "wifi";
  if (t === NetworkStateType.CELLULAR) return "cellular";
  return "other";
}

function commit(online: boolean, type?: NetworkStateType, cause: OfflineCause = "no_network", detail = ""): void {
  const was = useNetStore.getState();
  if (online !== was.online || (!online && cause !== was.cause)) netLog(online ? "ONLINE" : `OFFLINE ${cause}`, detail);
  useNetStore.setState({
    online,
    cause: online ? "" : cause,
    detail: online ? "" : detail,
    kind: online ? kindOf(type) : "none",
    slow: online ? was.slow : false,
    serverDown: online ? was.serverDown : false,
    offlineSince: online ? 0 : was.online ? Date.now() : was.offlineSince,
    restoredAt: online && !was.online ? Date.now() : was.restoredAt,
  });
  onlineManager.setOnline(online);
  if (online && !was.online) {
    for (const fn of backOnline) {
      try { fn(); } catch { /* one listener must not stop the others */ }
    }
  }
}

const TRY_MS = 6000;
const GAP_MS = 1200;

// Our own reachability check: any HTTP answer from the API (even a 404) proves the internet works. Two tries a moment apart, each
// given 6 s, so a slow first TLS handshake or a network that is still coming up does not read as "no internet".
let lastProbe = "";
function logProbe(p: Probe): void {
  const what = p.ok ? "ok" : `fail: ${p.error}`;
  if (what === lastProbe) return; // the same failure every recheck while offline says nothing new
  lastProbe = what;
  netLog("probe", p.ok ? `ok ${p.ms} ms` : `fail ${p.ms} ms: ${p.error}`);
}

async function apiReachable(): Promise<Probe> {
  const first = await probeApi(TRY_MS);
  logProbe(first);
  if (first.ok) return first;
  await new Promise((r) => setTimeout(r, GAP_MS));
  const second = await probeApi(TRY_MS);
  logProbe(second);
  return second;
}

let generation = 0;
let retry: ReturnType<typeof setTimeout> | null = null;
let lastOs = "";

function scheduleRecheck(): void {
  if (retry) return;
  retry = setTimeout(() => {
    retry = null;
    void recheckNetwork();
  }, 10_000);
}

/** `force`: re-decide even if the OS repeats the same state (the periodic recheck, the app coming to the foreground, the retry button). */
export function applyNetworkState(s: NetworkState, force = false): void {
  const sig = `${String(s.type)} connected=${String(s.isConnected)} internet=${String(s.isInternetReachable)}`;
  const same = sig === lastOs;
  lastOs = sig;
  const st = useNetStore.getState();
  // While offline the same OS state again tells nothing new (Android repeats it every few seconds while a per-app restriction blocks
  // the app); the periodic recheck looks again on its own, so each repeat does not start a request.
  if (same && !st.online && !force) return;
  const gen = (generation += 1);
  const verdict = verdictOf(s, NetworkStateType.NONE);
  if (!same) netLog("os", `${sig} -> ${verdict}`);
  // "Online" is believed at once — unless LexGo was found blocked: Android keeps reporting the very network a per-app restriction
  // keeps the app off, so then our own request decides.
  if (verdict === "online" && st.cause !== "denied") return commit(true, s.type);
  // The OS says "offline" or "connected, internet not reachable". Neither is believed on its own: iOS reports an unsatisfied path for a
  // moment at launch, on a new install, behind a VPN or while it waits for the radio, and expo-network turns a missed path update into
  // "no connection". Only when our own API cannot be reached either is the device offline — and then the OS is asked why, so a phone
  // that has internet but does not let LexGo use it (Mobile Data off for the app) is told so instead of "no internet".
  void (async () => {
    const probe = await apiReachable();
    if (gen !== generation) return; // a newer state arrived meanwhile
    if (probe.ok) return commit(true, s.type);
    const path = await readOsPath();
    if (gen !== generation) return;
    commit(false, s.type, isDenied(path) ? "denied" : "no_network", `${describeOsPath(path)} · ${probe.error}`);
    scheduleRecheck(); // the OS will not announce a change if it stays "unreachable": look again
  })();
}

/** Re-reads the OS state and decides again (app came to the foreground, retry button, the periodic recheck while offline). */
export async function recheckNetwork(): Promise<void> {
  try {
    applyNetworkState(await getNetworkStateAsync(), true);
  } catch {
    /* keep the last known state */
  }
}

/**
 * One of our own requests failed while the OS reports a network (GET /health, see health.ts). Android does not show a per-app
 * restriction in that state, so the OS is asked directly: if it keeps LexGo off the network, the app goes offline with that cause
 * (true is returned) instead of calling the server down.
 */
export async function noteApiUnreachable(error: string): Promise<boolean> {
  const path = await readOsPath();
  if (!isDenied(path)) return false;
  generation += 1;
  commit(false, undefined, "denied", `${describeOsPath(path)} · ${error}`);
  scheduleRecheck();
  return true;
}

export function startNetworkMonitor(): () => void {
  netLog("start", `${Platform.OS} ${String(Platform.Version)}`);
  void readOsPath().then((p) => netLog("os-path", describeOsPath(p))); // what the OS gives this app at launch, for the journal
  void recheckNetwork();
  const sub = addNetworkStateListener((s) => applyNetworkState(s));
  // A real answer from the API beats any OS flag: if the banner says offline but a request just succeeded, we are online.
  onReached(() => {
    if (!useNetStore.getState().online) {
      generation += 1;
      netLog("reached", "an API request succeeded");
      commit(true);
    }
  });
  return () => {
    sub.remove();
    onReached(null);
    if (retry) clearTimeout(retry);
    retry = null;
  };
}
