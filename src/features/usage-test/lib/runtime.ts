import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { randomUUID } from "expo-crypto";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { EMPTY, type Persisted, type Registration, type Track } from "../model/types";

const QUEUE_KEY = "lexgo_usage_test_v1"; // the event queue + backend installation id (no raw key, no coordinates, nothing personal)
const KEY_KEY = "lexgo_usage_install_key"; // the raw installation key: encrypted store only, never logged

// Play testing track of this build (EXPO_PUBLIC_PLAY_TRACK: internal | closed | open); "closed" unless the release config says otherwise.
export function playTrack(): Track {
  const v = (process.env.EXPO_PUBLIC_PLAY_TRACK || "closed").trim().toLowerCase();
  return v === "internal" || v === "open" ? v : "closed";
}

// One stable key per installed app instance: a random UUID kept in the encrypted store. Not the Android ID, IMEI, serial, MAC, SIM or
// Advertising ID, and not the push token (it rotates). It survives sign-out / sign-in and token refresh; reinstalling makes a new one.
let cached = "";
export async function installationKey(): Promise<string> {
  if (cached) return cached;
  const got = await SecureStore.getItemAsync(KEY_KEY).catch(() => null);
  if (got) return (cached = got);
  const made = randomUUID();
  await SecureStore.setItemAsync(KEY_KEY, made).catch(() => undefined);
  return (cached = made);
}

// The registration body for this device (expo-device / expo-application: no permission needed).
export async function registrationFor(locale: string): Promise<Registration> {
  return {
    installation_key: await installationKey(),
    platform: "android",
    distribution_track: playTrack(),
    app_version: Application.nativeApplicationVersion ?? "",
    version_code: Number(Application.nativeBuildVersion) || 0,
    manufacturer: Device.manufacturer ?? "",
    model: Device.modelName ?? "",
    os_version: Device.osVersion ?? "",
    locale,
  };
}

export async function loadPersisted(): Promise<Persisted> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Persisted>) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export const savePersisted = (p: Persisted): Promise<void> => AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(p));

export const newId = (): string => randomUUID();
