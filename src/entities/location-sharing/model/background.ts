import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from "expo-task-manager";
import { ApiError } from "@/shared/api";
import { sendLocationApi, stopSharingApi } from "../api/locationApi";
import { BG_OFF, bgIntervalMs, decideBackground, type BgRecord } from "../lib/background";

export const BG_TASK = "lexgo-seller-location";
const KEY = "lexgo_loc_bg_v1";

type LocationModule = typeof import("expo-location");
const native = (): Promise<LocationModule> => import("expo-location");

export async function readBg(): Promise<BgRecord> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...BG_OFF, ...(JSON.parse(raw) as Partial<BgRecord>) } : BG_OFF;
  } catch {
    return BG_OFF;
  }
}
export const writeBg = (r: BgRecord) => AsyncStorage.setItem(KEY, JSON.stringify(r)).catch(() => undefined);

export async function stopBackground(): Promise<void> {
  await writeBg(BG_OFF);
  try {
    const L = await native();
    if (await L.hasStartedLocationUpdatesAsync(BG_TASK)) await L.stopLocationUpdatesAsync(BG_TASK);
  } catch {
    // nothing was running
  }
}

// The seller allowed background updates: ask the OS for "allow all the time" (after the in-app disclosure), then start the updates with
// Android's foreground service — its notification is always visible while sharing and stops it in one tap from the app.
// Resolves false when the permission was not given (the share keeps running while the app is open).
export async function startBackground(r: Omit<BgRecord, "background" | "enabled">, intervalSec: number, notice: { title: string; body: string }): Promise<boolean> {
  const L = await native();
  const fg = await L.getForegroundPermissionsAsync();
  if (fg.status !== "granted") return false;
  const bg = await L.requestBackgroundPermissionsAsync();
  if (bg.status !== "granted") return false;
  await writeBg({ ...r, enabled: true, background: true });
  if (await L.hasStartedLocationUpdatesAsync(BG_TASK)) await L.stopLocationUpdatesAsync(BG_TASK);
  await L.startLocationUpdatesAsync(BG_TASK, {
    accuracy: L.Accuracy.Balanced,
    timeInterval: bgIntervalMs(intervalSec),
    deferredUpdatesInterval: bgIntervalMs(intervalSec),
    distanceInterval: 0,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: { notificationTitle: notice.title, notificationBody: notice.body, notificationColor: "#1668F0", killServiceOnDestroy: false },
  });
  return true;
}

// The task itself (defined at app start, see index.ts): each fix is sent as `source: background` while the share is on; a share that was
// switched off or has ended stops the updates (and, when it ended, tells the server). Nothing is retried in the background; a refused
// token (401 / 403) stops it as well — the app will ask again when it is opened.
TaskManager.defineTask<{ locations?: { coords: { latitude: number; longitude: number; accuracy: number | null }; timestamp: number }[] }>(BG_TASK, async ({ data, error }) => {
  if (error) return;
  const last = data?.locations?.[data.locations.length - 1];
  const d = decideBackground(await readBg(), Date.now());
  if (d.kind === "stop") {
    await stopBackground();
    if (d.expired) await stopSharingApi().catch(() => undefined);
    return;
  }
  if (!last) return;
  try {
    await sendLocationApi({ latitude: last.coords.latitude, longitude: last.coords.longitude, accuracy: last.coords.accuracy ?? null, at: last.timestamp }, d.durationHours, "background");
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) await stopBackground();
  }
});
