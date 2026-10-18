import { http } from "@/shared/api";
import { buildBody, normSharing } from "../lib/sharing";
import type { Fix, SharingResult } from "../model/types";

// POST /marketplace/me/location-sharing {enabled:false} — stop.
export async function stopSharingApi(): Promise<SharingResult> {
  return normSharing(await http("/marketplace/me/location-sharing", { method: "POST", body: buildBody({ enabled: false }) }));
}

// POST /marketplace/me/location-sharing — start, or resend the position while sharing is on.
export async function sendLocationApi(fix: Fix, durationHours: number | null): Promise<SharingResult> {
  const body = buildBody({ enabled: true, durationHours, latitude: fix.latitude, longitude: fix.longitude, accuracyMeters: fix.accuracy ?? undefined, source: "foreground" });
  return normSharing(await http("/marketplace/me/location-sharing", { method: "POST", body }));
}
