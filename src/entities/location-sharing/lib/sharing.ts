import { asDict as asObject } from "@/shared/lib/json";
import type { SharingPolicy, SharingResult } from "../model/types";

// Durations the server accepts (web LOCATION_DURATIONS); null = until switched off.
export const LOCATION_DURATIONS = [1, 4, 8, 12] as const;

export const DEFAULT_POLICY: SharingPolicy = { foregroundIntervalSec: 300, backgroundIntervalSec: 600, staleAfterSec: 1200, retentionDays: 30 };

type StartBody = { enabled: true; durationHours: number | null; latitude: number; longitude: number; accuracyMeters?: number; source?: string };

// POST body: {enabled:false} to stop, the full fix to start/refresh.
export function buildBody(e: { enabled: false } | StartBody): Record<string, unknown> {
  if (!e.enabled) return { enabled: false };
  if (e.durationHours !== null && !(LOCATION_DURATIONS as readonly number[]).includes(e.durationHours)) throw new RangeError("duration_hours");
  if (!Number.isFinite(e.latitude) || !Number.isFinite(e.longitude)) throw new RangeError("coordinates");
  const body: Record<string, unknown> = { enabled: true, duration_hours: e.durationHours, latitude: e.latitude, longitude: e.longitude, source: e.source ?? "foreground" };
  if (typeof e.accuracyMeters === "number" && Number.isFinite(e.accuracyMeters)) body.accuracy_meters = Math.max(0, Math.round(e.accuracyMeters));
  return body;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const pick = (o: Record<string, unknown>, keys: string[], fallback: number): number => {
  for (const k of keys) {
    const n = num(o[k]);
    if (n !== null && n > 0) return n;
  }
  return fallback;
};
const nonEmpty = (o: Record<string, unknown>) => Object.keys(o).length > 0;

// Response of POST /marketplace/me/location-sharing (state under location_sharing / sharing / state, policy beside it).
export function normSharing(raw: unknown): SharingResult {
  const root = asObject(raw);
  const st0 = asObject(root.location_sharing ?? root.sharing ?? root.state);
  const st = nonEmpty(st0) ? st0 : root;
  const p0 = asObject(root.policy ?? st.policy ?? root.location_policy);
  const p = nonEmpty(p0) ? p0 : root;
  const flag = st.enabled ?? st.is_enabled ?? st.active;
  const d = DEFAULT_POLICY;
  return {
    enabled: typeof flag === "boolean" ? flag : str(st.status).toLowerCase() === "active",
    durationHours: num(st.duration_hours),
    expiresAt: str(st.expires_at ?? st.active_until ?? st.sharing_until),
    updatedAt: str(st.updated_at ?? st.last_seen_at),
    policy: {
      foregroundIntervalSec: pick(p, ["foreground_update_interval_seconds", "foreground_interval_seconds", "foreground_update_interval", "foreground_interval"], d.foregroundIntervalSec),
      backgroundIntervalSec: pick(p, ["background_update_interval_seconds", "background_interval_seconds", "background_update_interval", "background_interval"], d.backgroundIntervalSec),
      staleAfterSec: pick(p, ["stale_after_seconds", "stale_after", "stale_seconds"], d.staleAfterSec),
      retentionDays: pick(p, ["retention_days", "retention_period_days", "retention"], d.retentionDays),
    },
  };
}

// Absolute end of a timed share: the server's expires_at when it is in the future, else now + hours.
export function untilMs(expiresAt: string, hours: number | null, now: number): number | null {
  if (hours === null) return null;
  const t = expiresAt ? Date.parse(expiresAt) : NaN;
  return Number.isFinite(t) && t > now ? t : now + 3600_000 * hours;
}

// Refresh keeps the duration preset that still fits in the time left (web resend rule).
export function remainingPreset(leftMs: number): number | null {
  if (!Number.isFinite(leftMs)) return null;
  let best: number = LOCATION_DURATIONS[0];
  for (const h of LOCATION_DURATIONS) if (3600_000 * h <= leftMs) best = h;
  return best;
}

export const shownAccuracy = (m: number | null): number | null => (m === null ? null : Math.max(1, Math.round(m)));
