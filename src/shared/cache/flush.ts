import { onlineManager } from "@tanstack/react-query";
import { accessToken, ApiError } from "@/shared/api";
import { backoffMs, flushVerdict, MAX_ATTEMPTS } from "./backoff";
import { safely } from "./db";
import { handlerFor, invalidateFor, listOutbox, markSending } from "./outbox";
import { refreshOutboxCount } from "./outboxStore";
import { cacheEpoch, cacheScope, sameCacheEpoch } from "./scope";

export type FlushResult = { sent: number; dropped: number; left: number; keys: (readonly unknown[])[] };
let running: Promise<FlushResult> | null = null;
const listeners = new Set<(r: FlushResult) => void>();

/** Called after every flush that sent or dropped something (the app invalidates the touched queries and tells the user about drops). */
export function onFlushed(fn: (r: FlushResult) => void): () => void {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

const del = (id: number) => safely(undefined, async (d) => void (await d.runAsync("DELETE FROM outbox WHERE id = ?", id)));
const later = (id: number, attempts: number) => safely(undefined, async (d) => void (await d.runAsync("UPDATE outbox SET attempts = ?, next_at = ? WHERE id = ?", attempts, Date.now() + backoffMs(attempts), id)));

async function run(): Promise<FlushResult> {
  const out: FlushResult = { sent: 0, dropped: 0, left: 0, keys: [] };
  const now = Date.now();
  // The account the items belong to, noted once: if it signs out (or another one signs in, or the role changes)
  // while the loop runs, the loop stops — one user's write is never sent with another user's token.
  const scope = cacheScope();
  const at = cacheEpoch();
  if (!scope || !accessToken() || !onlineManager.isOnline()) {
    out.left = await refreshOutboxCount();
    return out; // nothing is attempted (and no attempt is counted) while offline or signed out
  }
  for (const item of await listOutbox(50)) {
    if (!sameCacheEpoch(scope, at) || !accessToken()) break;
    const handler = handlerFor(item.kind);
    if (!handler || item.nextAt > now) continue; // its owner registers the handler later / still backing off
    markSending(item.id);
    try {
      await handler(item.payload, item);
      await del(item.id);
      out.sent += 1;
      out.keys.push(...invalidateFor(item.kind));
    } catch (e) {
      const verdict = flushVerdict(e instanceof ApiError ? e.status : -1, item.attempts, MAX_ATTEMPTS, !!accessToken());
      if (verdict === "stop") break; // the link dropped mid-flush or the user was signed out: not the item's fault, no attempt counted
      if (verdict === "drop") {
        // A rejected write (4xx) or one that failed too often will never succeed: it is dropped and the screen reloads server truth.
        await del(item.id);
        out.dropped += 1;
        out.keys.push(...invalidateFor(item.kind));
        continue;
      }
      await later(item.id, item.attempts + 1);
      if (verdict === "retry-stop") break; // 401 with a live session: one attempt counted, the rest waits for the next run
    } finally {
      markSending(null);
    }
  }
  out.left = await refreshOutboxCount();
  if (out.sent || out.dropped) for (const fn of listeners) fn(out);
  return out;
}

/** Sends the queued writes oldest first, one at a time. Safe to call from several triggers at once. */
export function flushOutbox(): Promise<FlushResult> {
  running ??= run().finally(() => (running = null));
  return running;
}
