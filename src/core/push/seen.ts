import AsyncStorage from "@react-native-async-storage/async-storage";

// Events already announced (banner or OS alert), so the same event is never announced twice — not by
// its other channel rows (60 s window) and not by the background task (watermark = newest created_at).
const seen = new Map<string, number>();
const WATERMARK = "lexgo_alert_watermark";
const WINDOW_MS = 60_000;

export function wasSeen(key: string): boolean {
  const t = seen.get(key);
  return t !== undefined && Date.now() - t < WINDOW_MS;
}

export function markSeen(key: string, createdAt: string): void {
  seen.set(key, Date.now());
  if (seen.size > 200) for (const k of [...seen.keys()].slice(0, 80)) seen.delete(k);
  void advanceWatermark(createdAt);
}

export const readWatermark = async (): Promise<string> => (await AsyncStorage.getItem(WATERMARK).catch(() => null)) ?? "";
export async function advanceWatermark(createdAt: string): Promise<void> {
  if (createdAt && createdAt > (await readWatermark())) await AsyncStorage.setItem(WATERMARK, createdAt).catch(() => {});
}
