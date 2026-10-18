import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Secrets (tokens) go to the keychain / keystore; on web fall back to
// AsyncStorage because SecureStore is native-only.
const secureOk = Platform.OS !== "web";

export async function readSecret(key: string): Promise<string | null> {
  try {
    return secureOk ? await SecureStore.getItemAsync(key) : await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function writeSecret(key: string, value: string | null): Promise<void> {
  try {
    if (value == null) {
      if (secureOk) await SecureStore.deleteItemAsync(key);
      else await AsyncStorage.removeItem(key);
      return;
    }
    if (secureOk) await SecureStore.setItemAsync(key, value);
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
