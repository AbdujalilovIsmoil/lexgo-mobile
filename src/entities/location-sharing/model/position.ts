import type * as LocationApi from "expo-location";
import type { Fix, LocErrorKind } from "./types";

// expo-location is a native module: a build made before it was added throws when the JS module is evaluated. It is loaded on
// first use instead of at import, so the screen still opens and the user sees "unavailable" until the app is rebuilt.
let loaded: Promise<typeof LocationApi> | null = null;
async function native(): Promise<typeof LocationApi> {
  try {
    loaded ??= import("expo-location");
    return await loaded;
  } catch {
    loaded = null;
    throw new LocationFailure("build"); // the native module is not in this build of the app
  }
}

export class LocationFailure extends Error {
  kind: LocErrorKind;
  constructor(kind: LocErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

export const FIX_TIMEOUT_MS = 20_000;
export const FIX_MAX_AGE_MS = 60_000;

// One balanced-accuracy fix with a hard timeout (the OS call itself has none).
export async function readPosition(opts?: { maxAgeMs?: number; timeoutMs?: number }): Promise<Fix> {
  const timeoutMs = opts?.timeoutMs ?? FIX_TIMEOUT_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const Location = await native();
    if (opts?.maxAgeMs) {
      const last = await Location.getLastKnownPositionAsync({ maxAge: opts.maxAgeMs }).catch(() => null);
      if (last) return toFix(last);
    }
    const fresh = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const timeout = new Promise<never>((_, rej) => {
      timer = setTimeout(() => rej(new LocationFailure("timeout")), timeoutMs);
    });
    return toFix(await Promise.race([fresh, timeout]));
  } catch (e) {
    throw e instanceof LocationFailure ? e : new LocationFailure("unavailable");
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function toFix(l: LocationApi.LocationObject): Fix {
  const a = l.coords.accuracy;
  return { latitude: l.coords.latitude, longitude: l.coords.longitude, accuracy: typeof a === "number" && Number.isFinite(a) ? a : null, at: Date.now() };
}

export type Permission = "granted" | "denied" | "undetermined";

export async function readPermission(): Promise<{ status: Permission; canAskAgain: boolean }> {
  const r = await (await native()).getForegroundPermissionsAsync();
  return { status: r.status as Permission, canAskAgain: r.canAskAgain };
}

export async function askPermission(): Promise<{ status: Permission; canAskAgain: boolean }> {
  const r = await (await native()).requestForegroundPermissionsAsync();
  return { status: r.status as Permission, canAskAgain: r.canAskAgain };
}
