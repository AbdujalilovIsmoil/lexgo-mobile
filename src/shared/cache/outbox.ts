import { idempotencyKey } from "./backoff";
import { safely } from "./db";
import { refreshOutboxCount } from "./outboxStore";
import { cacheScope } from "./scope";
import { serialize } from "./sanitize";

// Offline write queue — ONLY for idempotent drafts and messages. Anything that moves money, changes who owns a record or answers an order
// (TZ.md §15: payment, accept, decline, complete, rating, complaint — and the warranty) is refused by name.
const FORBIDDEN = /(pay|claim|complete|approve|reject|delete|remove|transfer|cancel|refund|release|sign|otp|login|password|accept|decline|rating|complain|warrant)/i;
export type OutboxItem = { id: number; kind: string; dedupe: string; payload: unknown; createdAt: number; attempts: number; nextAt: number };
export type OutboxHandler = (payload: unknown, item: OutboxItem) => Promise<void>;
// invalidate: query keys to refetch once an item of this kind was sent (or dropped), so the screen shows server truth.
export type HandlerOptions = { invalidate?: readonly (readonly unknown[])[] };
const handlers = new Map<string, { run: OutboxHandler; invalidate: readonly (readonly unknown[])[] }>();
// The row whose request is on the wire right now (-1: none). It is never rewritten or replaced while in flight: its
// result decides whether it is deleted, so a change made meanwhile goes into a NEW row that is sent after it.
let sendingId = -1;
export const markSending = (id: number | null): void => {
  sendingId = id ?? -1;
};

export function registerOutboxHandler(kind: string, handler: OutboxHandler, opts: HandlerOptions = {}): void {
  if (FORBIDDEN.test(kind)) throw new Error(`outbox: "${kind}" is not an idempotent draft/message action`);
  handlers.set(kind, { run: handler, invalidate: opts.invalidate ?? [] });
}
export const handlerFor = (kind: string): OutboxHandler | undefined => handlers.get(kind)?.run;
export const invalidateFor = (kind: string): readonly (readonly unknown[])[] => handlers.get(kind)?.invalidate ?? [];

/** Headers that make a retried send recognisable to the backend (same value on every attempt of one item). */
export const idempotencyHeaders = (item: OutboxItem): Record<string, string> => ({ "Idempotency-Key": idempotencyKey(cacheScope(), item.kind, item.id, item.createdAt) });

/** Queues a write. A later item with the same kind+dedupe replaces the earlier one (latest draft wins). */
export async function enqueue(kind: string, payload: unknown, dedupe = ""): Promise<boolean> {
  const scope = cacheScope();
  const text = scope && !FORBIDDEN.test(kind) ? serialize(payload) : null;
  if (!text) return false;
  const ok = await safely(false, async (d) => {
    if (dedupe) await d.runAsync("DELETE FROM outbox WHERE scope = ? AND kind = ? AND dedupe = ? AND id != ?", scope, kind, dedupe, sendingId);
    await d.runAsync("INSERT INTO outbox (scope, kind, dedupe, payload, created_at) VALUES (?, ?, ?, ?, ?)", scope, kind, dedupe, text, Date.now());
    return true;
  });
  await refreshOutboxCount();
  return ok;
}

export async function listOutbox(limit = 50): Promise<OutboxItem[]> {
  const scope = cacheScope();
  if (!scope) return [];
  return safely<OutboxItem[]>([], async (d) => {
    const rows = await d.getAllAsync<{ id: number; kind: string; dedupe: string; payload: string; created_at: number; attempts: number; next_at: number }>("SELECT * FROM outbox WHERE scope = ? ORDER BY id LIMIT ?", scope, limit);
    return rows.map((r) => ({ id: r.id, kind: r.kind, dedupe: r.dedupe, payload: JSON.parse(r.payload) as unknown, createdAt: r.created_at, attempts: r.attempts, nextAt: r.next_at }));
  });
}

export async function discardOutbox(): Promise<void> {
  const scope = cacheScope();
  if (scope) await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM outbox WHERE scope = ?", scope)));
  await refreshOutboxCount();
}

/** Rewrites the payload of a queued item (e.g. a task edited again before its create was sent). false = no such item (or it is being sent right now). */
export async function patchOutbox(kind: string, dedupe: string, change: (old: unknown) => unknown): Promise<boolean> {
  const scope = cacheScope();
  if (!scope) return false;
  const ok = await safely(false, async (d) => {
    const r = await d.getFirstAsync<{ id: number; payload: string }>("SELECT id, payload FROM outbox WHERE scope = ? AND kind = ? AND dedupe = ? AND id != ? ORDER BY id DESC", scope, kind, dedupe, sendingId);
    if (!r) return false;
    const text = serialize(change(JSON.parse(r.payload) as unknown));
    if (!text) return false;
    await d.runAsync("UPDATE outbox SET payload = ? WHERE id = ?", text, r.id);
    return true;
  });
  if (ok) await refreshOutboxCount();
  return ok;
}

/** Removes a queued item (e.g. a task created and deleted again while offline). */
export async function removeOutbox(kind: string, dedupe: string): Promise<void> {
  const scope = cacheScope();
  if (scope) await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM outbox WHERE scope = ? AND kind = ? AND dedupe = ? AND id != ?", scope, kind, dedupe, sendingId)));
  await refreshOutboxCount();
}
