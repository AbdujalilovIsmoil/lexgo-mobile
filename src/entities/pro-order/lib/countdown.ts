import type { OrderRating } from "../model/extraTypes";

const clamp = (ms: number) => Math.max(0, ms);

// Milliseconds until an ISO deadline (0 when missing / passed). The backend's own deadline is the authority.
export function msUntil(iso: string, now: number): number {
  const end = Date.parse(iso);
  return Number.isFinite(end) ? clamp(end - now) : 0;
}

// The rating window left for the client: `deadline_at` first, the server's remaining seconds (counted from the fetch) as fallback.
export function ratingMsLeft(r: OrderRating, now: number): number {
  if (!r.available) return 0;
  const byDeadline = msUntil(r.deadlineAt, now);
  return byDeadline || (r.deadlineAt ? 0 : clamp(r.remainingSeconds * 1000 - (now - r.fetchedAt)));
}

// "23:59:07" - hours may pass 24 for a request still open on its last day.
export function hms(ms: number): string {
  const s = Math.ceil(clamp(ms) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}
