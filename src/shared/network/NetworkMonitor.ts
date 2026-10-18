import { onlineManager } from "@tanstack/react-query";
import { addNetworkStateListener, getNetworkStateAsync, NetworkStateType, type NetworkState } from "expo-network";
import { useNetStore, type NetKind } from "./netStore";

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

// isConnected / isInternetReachable are undefined while the OS is still working it out: not offline.
export function applyNetworkState(s: NetworkState): void {
  const online = s.isConnected !== false && s.isInternetReachable !== false;
  const was = useNetStore.getState();
  useNetStore.setState({
    online,
    kind: online ? kindOf(s.type) : "none",
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

export function startNetworkMonitor(): () => void {
  void getNetworkStateAsync().then(applyNetworkState).catch(() => {});
  const sub = addNetworkStateListener(applyNetworkState);
  return () => sub.remove();
}
