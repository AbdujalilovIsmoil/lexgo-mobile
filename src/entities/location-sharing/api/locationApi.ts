import { http } from "@/shared/api";
import { buildBody, normSharing } from "../lib/sharing";
import type { Fix, SharingResult } from "../model/types";

// POST /marketplace/me/location-sharing {enabled:false} — stop.
export async function stopSharingApi(): Promise<SharingResult> {
  return normSharing(await http("/marketplace/me/location-sharing", { method: "POST", body: buildBody({ enabled: false }) }));
}

// POST /marketplace/me/location-sharing — start, or resend the position while sharing is on.
export async function sendLocationApi(fix: Fix, durationHours: number | null, source: "foreground" | "background" = "foreground"): Promise<SharingResult> {
  const body = buildBody({ enabled: true, durationHours, latitude: fix.latitude, longitude: fix.longitude, accuracyMeters: fix.accuracy ?? undefined, source });
  return normSharing(await http("/marketplace/me/location-sharing", { method: "POST", body }));
}

// GET /marketplace/me/location-sharing — the server's own state (on / until / policy), read when the card opens so a share started
// before a restart (or on another device) is shown as it is.
export async function getSharingApi(): Promise<SharingResult> {
  return normSharing(await http("/marketplace/me/location-sharing"));
}
