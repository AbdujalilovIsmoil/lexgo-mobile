// One-shot device location for a user action (a client's "show specialists near me"). Nothing here is stored, logged or sent to
// analytics: the caller passes the fix straight to the request that needs it. expo-location is loaded on first use only.
type LocationModule = typeof import("expo-location");
let mod: Promise<LocationModule> | null = null;
const native = () => (mod ??= import("expo-location"));

export type DevicePermission = { status: "granted" | "denied" | "undetermined"; canAskAgain: boolean; precise: boolean | null };
export type DeviceFix = { latitude: number; longitude: number; accuracy: number | null };

const permOf = (r: { status: string; canAskAgain: boolean; android?: { accuracy?: string }; ios?: { accuracy?: string } }): DevicePermission => ({
  status: r.status === "granted" ? "granted" : r.status === "denied" ? "denied" : "undetermined",
  canAskAgain: r.canAskAgain,
  // Android "fine" / "coarse", iOS "full" / "reduced": a coarse (approximate) permission gives fixes of a few kilometres.
  precise: r.android?.accuracy ? r.android.accuracy === "fine" : r.ios?.accuracy ? r.ios.accuracy === "full" : null,
});

export const readLocationPermission = async (): Promise<DevicePermission> => permOf(await (await native()).getForegroundPermissionsAsync());
export const askLocationPermission = async (): Promise<DevicePermission> => permOf(await (await native()).requestForegroundPermissionsAsync());

export async function currentFix(timeoutMs = 20_000): Promise<DeviceFix> {
  const L = await native();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const p = await Promise.race([
      L.getCurrentPositionAsync({ accuracy: L.Accuracy.Balanced }),
      new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error("location_timeout")), timeoutMs); }),
    ]);
    return { latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy ?? null };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const openLocationSettings = async () => (await import("react-native")).Linking.openSettings();
