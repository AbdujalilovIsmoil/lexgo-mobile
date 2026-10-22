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
async function apiReachable(): Promise<Probe> {
  const first = await probeApi(TRY_MS);
  netLog("probe", first.ok ? `ok ${first.ms} ms` : `fail ${first.ms} ms: ${first.error}`);
  if (first.ok) return first;
  await new Promise((r) => setTimeout(r, GAP_MS));
  const second = await probeApi(TRY_MS);
  netLog("probe", second.ok ? `ok ${second.ms} ms` : `fail ${second.ms} ms: ${second.error}`);
  return second;
}

let generation = 0;
let retry: ReturnType<typeof setTimeout> | null = null;

function scheduleRecheck(): void {
  if (retry) return;
  retry = setTimeout(() => {
    retry = null;
    void recheckNetwork();
  }, 10_000);
}

export function applyNetworkState(s: NetworkState): void {
  const gen = (generation += 1);
  const verdict = verdictOf(s, NetworkStateType.NONE);
  netLog("os", `${String(s.type)} connected=${String(s.isConnected)} internet=${String(s.isInternetReachable)} -> ${verdict}`);
  if (verdict === "online") return commit(true, s.type);
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

/** Re-reads the OS state (app came to the foreground, retry button). */
export async function recheckNetwork(): Promise<void> {
  try {
    applyNetworkState(await getNetworkStateAsync());
  } catch {
    /* keep the last known state */
  }
}

export function startNetworkMonitor(): () => void {
  netLog("start", `${Platform.OS} ${String(Platform.Version)}`);
  void readOsPath().then((p) => netLog("os-path", describeOsPath(p))); // what the OS gives this app at launch, for the journal
  void recheckNetwork();
  const sub = addNetworkStateListener(applyNetworkState);
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
