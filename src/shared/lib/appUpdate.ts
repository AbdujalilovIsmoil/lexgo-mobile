import { create } from "zustand";
import { isOnline } from "@/shared/network/netStore";

type Native = typeof import("expo-updates");
export type UpdateStatus = "idle" | "checking" | "downloading" | "ready" | "latest" | "error" | "offline" | "off";

// expo-updates has a native part. A build made before it was added does not contain it, and importing it up front would crash the app at
// start-up: load it on first use; "not there" (or a development build) simply means updates are off. So does a build without an update
// channel — one installed straight from Xcode or Gradle, not built by EAS: the update server has nothing for it and every check failed,
// which the profile reported as "check your internet".
let cached: Native | null | undefined;
function native(): Native | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require("expo-updates") as Native;
    cached = m.isEnabled && !!m.channel ? m : null;
  } catch {
    cached = null;
  }
  return cached;
}

type Store = { status: UpdateStatus; checkedAt: number; set: (s: UpdateStatus) => void };
export const useUpdateStore = create<Store>((set) => ({ status: native() ? "idle" : "off", checkedAt: 0, set: (status) => set({ status, checkedAt: Date.now() }) }));

export const updatesAvailable = (): boolean => !!native();
/** The id of the JS bundle that runs now (empty in a build without updates). */
export const currentUpdateId = (): string => native()?.updateId ?? "";

let busy = false;
/** Ask the update server; when there is a newer JS bundle for this build, download it (it runs after a restart). */
export async function checkForUpdate(): Promise<UpdateStatus> {
  const u = native();
  const { set } = useUpdateStore.getState();
  if (!u) return "off";
  if (busy) return useUpdateStore.getState().status;
  busy = true;
  try {
    set("checking");
    const r = await u.checkForUpdateAsync();
    if (!r.isAvailable) return (set("latest"), "latest");
    set("downloading");
    const f = await u.fetchUpdateAsync();
    const out: UpdateStatus = f.isNew ? "ready" : "latest";
    set(out);
    return out;
  } catch {
    // Only a phone without a connection is told to check the internet; otherwise the update server did not answer.
    const out: UpdateStatus = isOnline() ? "error" : "offline";
    set(out);
    return out;
  } finally {
    busy = false;
  }
}

/** Restart the app on the downloaded bundle. */
export async function applyUpdate(): Promise<void> {
  await native()?.reloadAsync().catch(() => {});
}
