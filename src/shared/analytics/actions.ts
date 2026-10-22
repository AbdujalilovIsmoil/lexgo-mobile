import { ApiError } from "@/shared/api";
import { latencyBucket, sizeBucket } from "./buckets";
import { Platform } from "react-native";
import { track, type DocEventName } from "./client";

/** Class of a failure without its message (messages can quote user data). */
export function errorClass(e: unknown): string {
  if (e instanceof ApiError) return e.status === 0 ? "network" : e.status === 401 || e.status === 403 || e.status === 429 ? `http_${e.status}` : `http_${Math.floor(e.status / 100)}xx`;
  return e instanceof Error && e.name === "AbortError" ? "aborted" : "unknown";
}

/** action_started → action_completed | action_failed around a promise; the result is passed through. */
export async function trackAction<T>(action: string, run: () => Promise<T>, props?: Record<string, unknown>): Promise<T> {
  const t0 = Date.now();
  track("action_started", { action, ...props });
  try {
    const out = await run();
    track("action_completed", { action, latency: latencyBucket(Date.now() - t0), ...props });
    return out;
  } catch (e) {
    track("action_failed", { action, reason: errorClass(e), latency: latencyBucket(Date.now() - t0), ...props });
    throw e;
  }
}

export const funnel = (flow: string, step: string): void => track("funnel_step", { flow, step });
export const trackScreen = (screen: string): void => track("screen_view", { screen });
export const trackUpload = (flow: string, bytes: number): void => track("upload_size", { flow, size: sizeBucket(bytes) });
export const trackCallQuality = (quality: string, kind: string): void => track("call_quality", { quality, kind });
export const trackWsReconnect = (attempt: number): void => track("ws_reconnect", { attempt });

/** A ready-documents event: category, language, mode and status are the only metadata (the scrubber drops ids and free text anyway). */
export const trackDoc = (name: DocEventName, props?: { category?: string; language?: string; mode?: string; status?: string }): void => track(name, { platform: Platform.OS, ...props });
