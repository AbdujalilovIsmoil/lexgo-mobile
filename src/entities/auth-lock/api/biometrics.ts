import { Linking } from "react-native";
import * as LocalAuth from "expo-local-authentication";

export type BioKind = "face" | "fingerprint" | "iris";
export type BioInfo = { canLock: boolean; biometric: boolean; kinds: BioKind[] };
export type UnlockResult = "ok" | "cancel" | "lockout" | "unavailable" | "failed";

// While the system dialog is up the app goes inactive; the lock watcher must not read that as "left the app".
let busy = false;
let busyUntil = 0;
export const isAuthenticating = (): boolean => busy || Date.now() < busyUntil;

const KIND: Record<number, BioKind> = { 1: "fingerprint", 2: "face", 3: "iris" };

// What this device can do: biometrics, or at least a device passcode (the system dialog falls back to it).
export async function getBioInfo(): Promise<BioInfo> {
  try {
    const [enrolled, level, types] = await Promise.all([LocalAuth.isEnrolledAsync(), LocalAuth.getEnrolledLevelAsync(), LocalAuth.supportedAuthenticationTypesAsync()]);
    const kinds = [...new Set(types.map((t) => KIND[t]).filter((k): k is BioKind => !!k))];
    return { canLock: enrolled || level >= LocalAuth.SecurityLevel.SECRET, biometric: enrolled, kinds };
  } catch {
    return { canLock: false, biometric: false, kinds: [] };
  }
}

// One system prompt (Face ID / fingerprint, device passcode as the fallback). Never throws.
export async function authenticate(promptMessage: string, cancelLabel: string): Promise<UnlockResult> {
  busy = true;
  try {
    const r = await LocalAuth.authenticateAsync({ promptMessage, cancelLabel, disableDeviceFallback: false });
    if (r.success) return "ok";
    if (r.error === "lockout") return "lockout";
    if (r.error === "not_enrolled" || r.error === "not_available" || r.error === "passcode_not_set") return "unavailable";
    return r.error === "user_cancel" || r.error === "system_cancel" || r.error === "app_cancel" || r.error === "user_fallback" ? "cancel" : "failed";
  } catch {
    return "unavailable";
  } finally {
    busy = false;
    busyUntil = Date.now() + 1500;
  }
}

export const openDeviceSettings = (): void => {
  void Linking.openSettings().catch(() => {});
};
