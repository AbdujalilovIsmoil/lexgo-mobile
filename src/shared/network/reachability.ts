import type { NetworkState } from "expo-network";

// What the OS says is only a hint. "No interface at all" is certain; "connected but the internet is not reachable"
// is often wrong (Android emulators, captive-portal checks against Google that are blocked, VPN/DNS quirks), so that
// one case is settled by asking our own API. isConnected / isInternetReachable are undefined while the OS is still
// working it out: that is not offline.
export type Verdict = "online" | "offline" | "verify";

export function verdictOf(s: Pick<NetworkState, "isConnected" | "isInternetReachable"> & { type?: unknown }, noneType: unknown = "NONE"): Verdict {
  if (s.isConnected === false || s.type === noneType) return "offline";
  if (s.isInternetReachable === false) return "verify";
  return "online";
}
