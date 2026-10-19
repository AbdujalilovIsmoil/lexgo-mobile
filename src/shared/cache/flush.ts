import { onlineManager } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { backoffMs, isPermanentStatus, MAX_ATTEMPTS } from "./backoff";
import { safely } from "./db";
import { handlerFor, invalidateFor, listOutbox } from "./outbox";
import { refreshOutboxCount } from "./outboxStore";

export type FlushResult = { sent: number; dropped: number; left: number; keys: (readonly unknown[])[] };
let running: Promise<FlushResult> | null = null;
const listeners = new Set<(r: FlushResult) => void>();

/** Called after every flush that sent or dropped something (the app invalidates the touched queries and tells the user about drops). */
export function onFlushed(fn: (r: FlushResult) => void): () => void {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

const del = (id: number) => safely(undefined, async (d) => void (await d.runAsync("DELETE FROM outbox WHERE id = ?", id)));

async function run(): Promise<FlushResult> {
  const out: FlushResult = { sent: 0, dropped: 0, left: 0, keys: [] };
  const now = Date.now();
  if (!onlineManager.isOnline()) {
    out.left = await refreshOutboxCount();
    return out; // nothing is attempted (and no attempt is counted) while offline
  }
  for (const item of await listOutbox(50)) {
    const handler = handlerFor(item.kind);
    if (!handler || item.nextAt > now) continue; // its owner registers the handler later / still backing off
    try {
      await handler(item.payload, item);
      await del(item.id);
      out.sent += 1;
      out.keys.push(...invalidateFor(item.kind));
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) break; // the link dropped mid-flush: not the item's fault, no attempt counted
      // A rejected write (4xx) or one that failed too often will never succeed: it is dropped and the screen reloads server truth.
      if ((e instanceof ApiError && isPermanentStatus(e.status)) || item.attempts + 1 >= MAX_ATTEMPTS) {
        await del(item.id);
        out.dropped += 1;
        out.keys.push(...invalidateFor(item.kind));
        continue;
      }
      const attempts = item.attempts + 1;
      await safely(undefined, async (d) => void (await d.runAsync("UPDATE outbox SET attempts = ?, next_at = ? WHERE id = ?", attempts, Date.now() + backoffMs(attempts), item.id)));
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
