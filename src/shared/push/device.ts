import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { http } from "@/shared/api";
import { readSecret, writeSecret } from "@/shared/lib/storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";

// POST /devices (README "Remote Push"): the device's push token, so the backend can reach the app when it is in the background or closed.
export type DeviceRegistration = {
  platform: "android" | "ios";
  token_type: "fcm" | "apns" | "apns_voip";
  token: string;
  installation_id: string;
  app_version: string;
  locale: string;
  environment: "production" | "development";
};

/** True once the backend has this phone's token (this run): the settings page shows it. */
export const useRemoteRegistered = create<{ on: boolean }>(() => ({ on: false }));

const INSTALL_KEY = "lexgo_installation_id";
const DEVICE_KEY = "lexgo_push_device_id";
const SENT_KEY = "lexgo_push_sent";

/** The registration body for a token the OS handed out: Android's is an FCM token, iOS's (here) the APNs alert token. */
export function buildRegistration(token: string, installationId: string, locale: string, os: "android" | "ios" = Platform.OS === "ios" ? "ios" : "android"): DeviceRegistration {
  return {
    platform: os,
    token_type: os === "ios" ? "apns" : "fcm",
    token,
    installation_id: installationId,
    app_version: Application.nativeApplicationVersion ?? "",
    locale,
    environment: __DEV__ ? "development" : "production",
  };
}

/** One id per install, kept in the keychain / keystore: the backend tells "the same phone, new token" from "another phone". */
export async function installationId(): Promise<string> {
  const had = await readSecret(INSTALL_KEY);
  if (had) return had;
  const id = Crypto.randomUUID();
  await writeSecret(INSTALL_KEY, id);
  return id;
}

/** The backend's id of this device (answered_device_id of a call answer), "" until it is registered. */
export const deviceId = async (): Promise<string> => (await readSecret(DEVICE_KEY)) ?? "";

const idOf = (res: unknown): string => {
  const d = (res && typeof res === "object" ? res : {}) as Record<string, unknown>;
  const v = d.id ?? d.device_id;
  return typeof v === "string" || typeof v === "number" ? String(v) : "";
};

/** Registers (idempotent) when the token, the language or the app version differ from the last one sent; `force` skips that check. */
export async function sendRegistration(body: DeviceRegistration, force = false): Promise<boolean> {
  const sig = `${body.token_type}|${body.token}|${body.locale}|${body.app_version}|${body.environment}`;
  if (!force && (await readSecret(SENT_KEY)) === sig) {
    useRemoteRegistered.setState({ on: true });
    return false;
  }
  const res = await http("/devices", { method: "POST", body });
  await writeSecret(SENT_KEY, sig);
  useRemoteRegistered.setState({ on: true });
  const id = idOf(res);
  if (id) await writeSecret(DEVICE_KEY, id);
  return true;
}

/** Sign-out: tell the backend to stop pushing to this token, then forget everything local. Absent token = already done (204). */
export async function removeRegistration(token: string): Promise<void> {
  await http("/devices", { method: "DELETE", body: { token } }).catch(() => undefined);
  await writeSecret(DEVICE_KEY, null);
  await writeSecret(SENT_KEY, null);
  useRemoteRegistered.setState({ on: false });
}

// Any sign-out or account switch — also one the server forced, which skips DELETE /devices — forgets that this token was sent, so the
// account that signs in next registers it again instead of the backend keeping it on the previous account.
registerSessionReset(() => {
  void writeSecret(SENT_KEY, null);
  void writeSecret(DEVICE_KEY, null);
  useRemoteRegistered.setState({ on: false });
});
