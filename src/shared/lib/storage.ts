import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Secrets (tokens) go to the keychain / keystore; on web fall back to
// AsyncStorage because SecureStore is native-only.
const secureOk = Platform.OS !== "web";

// iOS keychain class: readable after the first unlock since boot (a push handled while the phone is locked still finds the session), and
// never copied to another device from a backup (a restored phone signs in again). The default, WHEN_UNLOCKED, was neither.
const OPTS: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

// Writing an existing item only replaces its value, not its class: an item saved before is moved once (deleted and saved again) the
// first time it is read. The keys already moved are remembered.
const MOVED_KEY = "lexgo_keychain_moved";
let moved: Set<string> | null = null;
async function moveOnce(key: string, value: string): Promise<void> {
  if (Platform.OS !== "ios") return;
  if (!moved) moved = new Set(JSON.parse((await AsyncStorage.getItem(MOVED_KEY)) ?? "[]") as string[]);
  if (moved.has(key)) return;
  await SecureStore.deleteItemAsync(key, OPTS);
  await SecureStore.setItemAsync(key, value, OPTS);
  moved.add(key);
  await AsyncStorage.setItem(MOVED_KEY, JSON.stringify([...moved]));
}

export async function readSecret(key: string): Promise<string | null> {
  try {
    if (!secureOk) return await AsyncStorage.getItem(key);
    const value = await SecureStore.getItemAsync(key, OPTS);
    if (value != null) await moveOnce(key, value).catch(() => undefined);
    return value;
  } catch {
    return null;
  }
}

export async function writeSecret(key: string, value: string | null): Promise<void> {
  try {
    if (value == null) {
      if (secureOk) await SecureStore.deleteItemAsync(key, OPTS);
      else await AsyncStorage.removeItem(key);
      return;
    }
    if (secureOk) await SecureStore.setItemAsync(key, value, OPTS);
    else await AsyncStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    if (value == null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}
