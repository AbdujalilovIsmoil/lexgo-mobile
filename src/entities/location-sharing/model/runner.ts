import { AppState } from "react-native";
import { ApiError } from "@/shared/api";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { sendLocationApi, stopSharingApi } from "../api/locationApi";
import { remainingPreset, untilMs } from "../lib/sharing";
import { LocationFailure, readPermission, readPosition, FIX_MAX_AGE_MS } from "./position";
import { patchShare, resetShare, useShareStore } from "./store";
import type { Fix, LocError } from "./types";

// Module-level controller: the loop outlives the card / sheet that started it.
let epoch = 0; // bumped on start / stop / reset; a stale async result is dropped
let timer: ReturnType<typeof setTimeout> | null = null;
let expiry: ReturnType<typeof setTimeout> | null = null;
let sub: { remove: () => void } | null = null;
let busy: Promise<void> | null = null;
let lastTick: number | null = null;

const MAX_TIMEOUT = 2_147_000_000;
const st = () => useShareStore.getState();
const active = (e: number) => e === epoch && st().mode === "on";
const foreground = () => AppState.currentState === "active";
const isAuthFail = (e: unknown) => e instanceof ApiError && (e.status === 401 || e.status === 403);
const err = (kind: LocError["kind"], stop?: boolean): LocError => ({ kind, stop });

function clearTimers() {
  if (timer) clearTimeout(timer);
  if (expiry) clearTimeout(expiry);
  timer = expiry = null;
  sub?.remove();
  sub = null;
}

function schedule(e: number, ms: number) {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!active(e)) return;
  timer = setTimeout(() => void tick(e), Math.min(MAX_TIMEOUT, Math.max(0, ms)));
}

function interval() {
  return 1000 * Math.max(1, st().policy.foregroundIntervalSec);
}

// Sends the position again while the app is open; at the end of a timed share, switches it off.
async function tick(e: number) {
  timer = null;
  if (!active(e) || !foreground() || busy) return;
  const s = st();
  const now = Date.now();
  if (!s.manual && s.until !== null && now >= s.until) return void (await expire());
  lastTick = now;
  busy = (async () => {
    try {
      const perm = await readPermission();
      if (e !== epoch) return;
      if (perm.status !== "granted") return void patchShare({ error: err("denied") });
      const fix = await readPosition({ maxAgeMs: FIX_MAX_AGE_MS });
      if (!active(e)) return;
      const left = st().manual || st().until === null ? null : remainingPreset(st().until! - Date.now());
      const r = await sendLocationApi(fix, left);
      if (e !== epoch) return;
      patchShare({ lastSentAt: Date.now(), lastAccuracy: fix.accuracy, policy: r.policy, error: null });
    } catch (x) {
      if (e !== epoch) return;
      if (isAuthFail(x)) return void resetShare("off");
      patchShare({ error: x instanceof LocationFailure ? err(x.kind) : err("server") });
    }
  })();
  try {
    await busy;
  } finally {
    busy = null;
    if (active(e) && foreground()) schedule(e, interval());
  }
}

async function expire() {
  clearTimers();
  epoch++;
  resetShare("off");
  try {
    await stopSharingApi();
  } catch (x) {
    if (!isAuthFail(x)) patchShare({ error: err("server", true) });
  }
}

// Arms the loop for the current share (after a successful start).
function arm() {
  clearTimers();
  const e = epoch;
  const s = st();
  if (!s.manual && s.until !== null) {
    expiry = setTimeout(() => void tick(e), Math.min(MAX_TIMEOUT, Math.max(0, s.until - Date.now())));
  }
  sub = AppState.addEventListener("change", (state) => {
    if (!active(e)) return;
    if (state !== "active") {
      if (timer) clearTimeout(timer);
      timer = null;
      return;
    }
    const left = lastTick === null && st().lastSentAt === null ? 0 : interval() - (Date.now() - (st().lastSentAt ?? lastTick ?? 0));
    if (!st().manual && st().until !== null && Date.now() >= st().until!) return void tick(e);
    schedule(e, left);
  });
  schedule(e, interval());
}

// Starts sharing with the fix the sheet just read. Throws on a server failure (state/error are set too).
export async function startSharing(durationHours: number | null, fix: Fix): Promise<void> {
  const prev = st().mode === "starting" || st().mode === "stopping" ? "unknown" : st().mode;
  clearTimers();
  const e = ++epoch;
  patchShare({ mode: "starting", error: null });
  try {
    const r = await sendLocationApi(fix, durationHours);
    if (e !== epoch) return;
    const now = Date.now();
    lastTick = now;
    patchShare({ mode: "on", manual: durationHours === null, until: untilMs(r.expiresAt, durationHours, now), policy: r.policy, lastSentAt: now, lastAccuracy: fix.accuracy, error: null });
    arm();
  } catch (x) {
    if (e === epoch) patchShare({ mode: prev, error: err("server") });
    throw x;
  }
}

// Switches sharing off on the server. Resolves false when the server call failed.
export async function stopSharing(): Promise<boolean> {
  clearTimers();
  const e = ++epoch;
  patchShare({ mode: "stopping", until: null, manual: false, error: null });
  try {
    if (busy) await busy.catch(() => undefined);
    await stopSharingApi();
    if (e === epoch) patchShare({ mode: "off", error: null });
    return true;
  } catch {
    if (e === epoch) patchShare({ mode: "off", error: err("server", true) });
    return false;
  }
}

registerSessionReset(() => {
  epoch++;
  clearTimers();
});
