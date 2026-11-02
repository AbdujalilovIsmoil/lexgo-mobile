// Android Play test usage analytics (backend contract "LexGo Android Play Test Usage Analytics", 1 Nov 2026).
// Only whole-app foreground time is measured: no screens, taps, text, location or hardware identifiers.

export type UsageEventType = "foreground" | "heartbeat" | "background";
export type Track = "internal" | "closed" | "open";

// GET /mobile/testing/config — the backend is the source of truth for every number here.
export type UsageConfig = {
  enabled: boolean;
  platforms: string[];
  heartbeatSeconds: number;
  staleSeconds: number;
  offlineSyncDays: number;
  batchMax: number;
};

export const DEFAULT_CONFIG: UsageConfig = { enabled: false, platforms: ["android"], heartbeatSeconds: 60, staleSeconds: 180, offlineSyncDays: 7, batchMax: 500 };

// POST /mobile/testing/installations/register body (installation_key is the raw local key; the backend keeps only its HMAC).
export type Registration = {
  installation_key: string;
  platform: "android";
  distribution_track: Track;
  app_version: string;
  version_code: number;
  manufacturer: string;
  model: string;
  os_version: string;
  locale: string;
};

// One locally queued event. `installation_id` is filled at send time (an event may be queued before sign-in).
export type QueuedEvent = {
  event_id: string;
  client_session_id: string;
  event_type: UsageEventType;
  occurred_at: string; // ISO 8601, UTC
  retries: number;
  created_at: number; // local epoch ms
};

// What survives an app restart.
export type Persisted = {
  queue: QueuedEvent[];
  installationId: string; // backend installation UUID ("" before registration)
  fingerprint: string; // the registration it was made with (user + metadata); a change re-registers
  skewMs: number; // server clock − local clock, applied to new timestamps
};

export const EMPTY: Persisted = { queue: [], installationId: "", fingerprint: "", skewMs: 0 };

export type SendBody = { installation_id: string; event_id: string; client_session_id: string; occurred_at: string };
export type SendResult = { serverTime: string; duplicate: boolean };
export type BatchResult = { serverTime: string; accepted: string[] };
