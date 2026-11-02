import { remainingPreset } from "./sharing";

// What the background task knows about the share without the app's memory (it may run after the app was killed): kept on the phone
// next to nothing else — no coordinates, only whether sharing is on, until when, and whether the seller allowed background updates.
export type BgRecord = { enabled: boolean; background: boolean; until: number | null; manual: boolean };
export const BG_OFF: BgRecord = { enabled: false, background: false, until: null, manual: false };

export type BgDecision = { kind: "send"; durationHours: number | null } | { kind: "stop"; expired: boolean };

// One background fix arrived: send it (with the duration preset that still fits), or stop the updates for good — sharing was switched
// off, background updates were not allowed, or a timed share has ended (then the server is told to stop too).
export function decideBackground(r: BgRecord, now: number): BgDecision {
  if (!r.enabled || !r.background) return { kind: "stop", expired: false };
  if (!r.manual && r.until !== null && now >= r.until) return { kind: "stop", expired: true };
  return { kind: "send", durationHours: r.manual || r.until === null ? null : remainingPreset(r.until - now) };
}

// The OS asks how often to wake up: the backend's background interval (600 s by default), never more often than a minute.
export const bgIntervalMs = (sec: number): number => Math.max(60, Math.round(sec || 600)) * 1000;
