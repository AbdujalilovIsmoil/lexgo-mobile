import * as Application from "expo-application";

// Snapshots written by another app version (or another response shape) are ignored: bump SHAPE after changing a
// response normaliser; a new app version already invalidates everything by itself.
const SHAPE = "1";
function appVersion(): string {
  try {
    return `${Application.nativeApplicationVersion ?? "0"}.${Application.nativeBuildVersion ?? "0"}`;
  } catch {
    return "0";
  }
}
export const CACHE_VERSION = `${SHAPE}@${appVersion()}`;
