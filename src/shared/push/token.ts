import * as Notifications from "expo-notifications";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { readSecret, writeSecret } from "@/shared/lib/storage";
import { buildRegistration, installationId, removeRegistration, sendRegistration } from "./device";
import { readPermission } from "./permission";

export type TokenResult = "denied" | "error" | "uploaded" | "unchanged";
const KEY = "lexgo_push_token";

const tokenOf = (data: unknown): string => (typeof data === "string" ? data : "");

/**
 * Obtains the device push token (FCM on Android, APNs on iOS) and registers it with POST /devices. Safe to call again and again: the
 * backend call is made only when the token, the language or the app version changed. The token is never logged.
 */
export async function registerPushToken(token?: string, force = false): Promise<TokenResult> {
  if ((await readPermission()).status !== "granted") return "denied";
  try {
    const t = token ?? tokenOf((await Notifications.getDevicePushTokenAsync()).data);
    if (!t) return "error";
    await writeSecret(KEY, t);
    const sent = await sendRegistration(buildRegistration(t, await installationId(), useLocaleStore.getState().locale), force);
    return sent ? "uploaded" : "unchanged";
  } catch {
    return "error"; // no Firebase config in this build, no network, … — the live connection and the periodic check still alert
  }
}

/** Sign-out: delete the token on the backend and forget it here. */
export async function forgetPushToken(): Promise<void> {
  const had = await readSecret(KEY);
  await writeSecret(KEY, null);
  if (had) await removeRegistration(had);
}
