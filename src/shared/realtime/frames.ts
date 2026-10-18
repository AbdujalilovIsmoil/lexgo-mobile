import { emit } from "./bus";

// 1s, 2s, 4s, 8s, then 30s at most (TZ 37.6); jitter spreads a mass reconnect.
const LADDER = [1000, 2000, 4000, 8000, 16000, 30000];
export const PING_MS = 25_000;
export const backoff = (attempt: number): number => LADDER[Math.min(attempt, LADDER.length - 1)] + Math.random() * 400;

// One text frame → one event on the bus; keepalive answers and junk are dropped.
export function onFrame(data: unknown): void {
  try {
    const o: unknown = JSON.parse(String(data));
    const name = o && typeof o === "object" ? (o as { event?: unknown }).event : undefined;
    if (typeof name === "string" && name !== "pong") emit(o as { event: string });
  } catch {
    /* not JSON */
  }
}
