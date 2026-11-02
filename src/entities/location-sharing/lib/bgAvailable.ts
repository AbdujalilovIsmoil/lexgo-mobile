import Constants from "expo-constants";

type PluginEntry = string | [string, Record<string, unknown>?];

// Whether this build declares background location (expo-location's config plugin in app.json). A build without it cannot ask for
// "allow all the time", so the seller is not offered background sharing at all (Play: no background-location declaration needed).
export function bgLocationBuilt(plugins: PluginEntry[] | undefined, os: string): boolean {
  const entry = (plugins ?? []).find((p) => (Array.isArray(p) ? p[0] : p) === "expo-location");
  const o = Array.isArray(entry) ? entry[1] ?? {} : {};
  return os === "ios" ? o.isIosBackgroundLocationEnabled === true : o.isAndroidBackgroundLocationEnabled === true;
}

export const bgLocationAvailable = (os: string): boolean => bgLocationBuilt(Constants.expoConfig?.plugins as PluginEntry[] | undefined, os);
