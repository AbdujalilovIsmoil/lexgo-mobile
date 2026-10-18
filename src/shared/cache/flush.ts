import { ApiError } from "@/shared/api";
import { safely } from "./db";
import { handlerFor, listOutbox } from "./outbox";
import { refreshOutboxCount } from "./outboxStore";

export type FlushResult = { sent: number; dropped: number; left: number };
let running: Promise<FlushResult> | null = null;

// 4xx other than 401/429 will never succeed on a retry: the item is dropped, not retried.
const permanent = (e: unknown): boolean => e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 408 && e.status !== 429;

async function run(): Promise<FlushResult> {
  const out: FlushResult = { sent: 0, dropped: 0, left: 0 };
  for (const item of await listOutbox(50)) {
    const handler = handlerFor(item.kind);
    if (!handler) continue; // its owner registers the handler later
    try {
      await handler(item.payload, item);
      await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM outbox WHERE id = ?", item.id)));
      out.sent += 1;
    } catch (e) {
      if (permanent(e) || item.attempts >= 4) {
        await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM outbox WHERE id = ?", item.id)));
        out.dropped += 1;
        continue;
      }
      await safely(undefined, async (d) => void (await d.runAsync("UPDATE outbox SET attempts = attempts + 1 WHERE id = ?", item.id)));
      break; // network / 5xx / 401: keep the order, try again at the next trigger
    }
  }
  out.left = await refreshOutboxCount();
  return out;
}

/** Sends the queued writes oldest first, one at a time. Safe to call from several triggers at once. */
export function flushOutbox(): Promise<FlushResult> {
  running ??= run().finally(() => (running = null));
  return running;
}
