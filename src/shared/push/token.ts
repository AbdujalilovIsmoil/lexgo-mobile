import * as Notifications from "expo-notifications";
import { http } from "@/shared/api";
import { PUSH_TOKEN_ENABLED, PUSH_TOKEN_PATH } from "@/shared/config/infra";
import { readSecret, writeSecret } from "@/shared/lib/storage";
import { readPermission } from "./permission";

export type TokenResult = "disabled" | "denied" | "no_endpoint" | "error" | "uploaded";
const KEY = "lexgo_push_token";

/**
 * Obtains the device push token and, when an endpoint is configured, sends it to the backend.
 * Today the backend has NO device-token endpoint (TZ 46 lists none), so the default is
 * PUSH_TOKEN_ENABLED=false → "disabled", and with the flag on but no path → "no_endpoint"
 * (the token is only kept in SecureStore). Set EXPO_PUBLIC_PUSH_TOKEN=1 and
 * EXPO_PUBLIC_PUSH_TOKEN_PATH=/… once the backend adds it. The token is never logged.
 */
export async function registerPushToken(): Promise<TokenResult> {
  if (!PUSH_TOKEN_ENABLED) return "disabled";
  if ((await readPermission()).status !== "granted") return "denied";
  try {
    const { data, type } = await Notifications.getDevicePushTokenAsync();
    const token = typeof data === "string" ? data : JSON.stringify(data);
    await writeSecret(KEY, token);
    if (!PUSH_TOKEN_PATH) return "no_endpoint";
    await http(PUSH_TOKEN_PATH, { method: "POST", body: { token, platform: type } });
    return "uploaded";
  } catch {
    return "error";
  }
}

/** Forget the stored token on sign-out (and tell the backend if it ever got one). */
export async function forgetPushToken(): Promise<void> {
  const had = await readSecret(KEY);
  await writeSecret(KEY, null);
  if (had && PUSH_TOKEN_PATH) await http(PUSH_TOKEN_PATH, { method: "DELETE", body: { token: had } }).catch(() => {});
}
