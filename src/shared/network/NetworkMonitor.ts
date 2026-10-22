import { onlineManager } from "@tanstack/react-query";
import { addNetworkStateListener, getNetworkStateAsync, NetworkStateType, type NetworkState } from "expo-network";
import { onReached } from "@/shared/api";
import { API_BASE } from "@/shared/config/env";
import { useNetStore, type NetKind } from "./netStore";
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

function commit(online: boolean, type?: NetworkStateType): void {
  const was = useNetStore.getState();
  useNetStore.setState({
    online,
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

// Our own reachability check: any HTTP answer from the API (even a 404) proves the internet works. Two tries, so one dropped packet
// on a slow link does not read as "no internet".
async function apiReachable(): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    try {
      await fetch(`${API_BASE}/health`, { method: "GET", signal: ctl.signal });
      return true;
    } catch {
      /* try once more */
    } finally {
      clearTimeout(timer);
    }
  }
  return false;
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
  if (verdictOf(s, NetworkStateType.NONE) === "online") return commit(true, s.type);
  // The OS says "offline" or "connected, internet not reachable". Neither is believed on its own: iOS reports an unsatisfied path for a
  // moment at launch, on a new install, behind a VPN or while it waits for the radio, and expo-network turns a missed path update into
  // "no connection". Only when our own API cannot be reached either is the device offline.
  void apiReachable().then((ok) => {
    if (gen !== generation) return; // a newer state arrived meanwhile
    commit(ok, s.type);
    if (!ok) scheduleRecheck(); // the OS will not announce a change if it stays "unreachable": look again
  });
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
  void recheckNetwork();
  const sub = addNetworkStateListener(applyNetworkState);
  // A real answer from the API beats any OS flag: if the banner says offline but a request just succeeded, we are online.
  onReached(() => {
    if (!useNetStore.getState().online) {
      generation += 1;
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
