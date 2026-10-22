import { requireOptionalNativeModule } from "expo-modules-core";

// The network path the OS gives this app (modules/net-path): on iOS NWPath with the reason it is unsatisfied, on Android whether the
// default network is blocked for the app. null in a build without the module (Expo Go, web, an old dev client).
export type OsPath = {
  status: "satisfied" | "unsatisfied" | "requiresConnection" | "unknown";
  reason: string; // none | notAvailable | cellularDenied | wifiDenied | localNetworkDenied | vpnInactive | blocked | other
  interfaces: string[];
  expensive?: boolean;
  constrained?: boolean;
  cellular?: "restricted" | "notRestricted" | "unknown"; // iOS: cellular data restricted for this app
  validated?: boolean; // Android
  dataSaver?: "on" | "off" | "allowed"; // Android
};

const native = requireOptionalNativeModule<{ readAsync(): Promise<OsPath> }>("NetPath");

export async function readOsPath(): Promise<OsPath | null> {
  if (!native) return null;
  try {
    return await native.readAsync();
  } catch {
    return null;
  }
}

/** The OS has a network but does not let LexGo use it: Mobile Data / Wireless Data switched off for the app, a per-app restriction. */
export const isDenied = (p: OsPath | null): boolean =>
  !!p && p.status !== "satisfied" && (p.reason === "cellularDenied" || p.reason === "wifiDenied" || p.reason === "blocked" || p.cellular === "restricted");

/** A short one-line summary for the connection journal and the settings card. */
export const describeOsPath = (p: OsPath | null): string =>
  !p ? "os: n/a" : `os: ${p.status}${p.reason !== "none" ? `/${p.reason}` : ""} [${p.interfaces.join(",") || "-"}]${p.cellular && p.cellular !== "unknown" ? ` cell:${p.cellular}` : ""}${p.constrained ? " low-data" : ""}${p.dataSaver === "on" ? " data-saver" : ""}`;
