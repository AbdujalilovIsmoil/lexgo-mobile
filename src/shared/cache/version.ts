import * as Application from "expo-application";

// Snapshots saved under another data shape are ignored: bump SHAPE after changing a response normaliser of a persisted query. Only the
// app's version (1.1.0) counts, not its build number: every new build used to throw the saved data away, so the first screen after each
// build started empty and looked broken until the network answered. A new app version still starts clean.
const SHAPE = "1";
function appVersion(): string {
  try {
    return Application.nativeApplicationVersion ?? "0";
  } catch {
    return "0";
  }
}
export const CACHE_VERSION = `${SHAPE}@${appVersion()}`;
