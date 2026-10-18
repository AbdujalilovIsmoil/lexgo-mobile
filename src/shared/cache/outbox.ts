import { safely } from "./db";
import { refreshOutboxCount } from "./outboxStore";
import { cacheScope } from "./scope";
import { serialize } from "./sanitize";

// Offline write queue — ONLY for idempotent drafts and messages. Anything that moves money or
// changes who owns a record is refused by name (TZ 38).
const FORBIDDEN = /(pay|claim|complete|approve|reject|delete|remove|transfer|cancel|refund|release|sign|otp|login|password)/i;
export type OutboxItem = { id: number; kind: string; dedupe: string; payload: unknown; createdAt: number; attempts: number };
export type OutboxHandler = (payload: unknown, item: OutboxItem) => Promise<void>;
const handlers = new Map<string, OutboxHandler>();

export function registerOutboxHandler(kind: string, handler: OutboxHandler): void {
  if (FORBIDDEN.test(kind)) throw new Error(`outbox: "${kind}" is not an idempotent draft/message action`);
  handlers.set(kind, handler);
}
export const handlerFor = (kind: string): OutboxHandler | undefined => handlers.get(kind);

/** Queues a write. A later item with the same kind+dedupe replaces the earlier one (latest draft wins). */
export async function enqueue(kind: string, payload: unknown, dedupe = ""): Promise<boolean> {
  const scope = cacheScope();
  const text = scope && !FORBIDDEN.test(kind) ? serialize(payload) : null;
  if (!text) return false;
  const ok = await safely(false, async (d) => {
    if (dedupe) await d.runAsync("DELETE FROM outbox WHERE scope = ? AND kind = ? AND dedupe = ?", scope, kind, dedupe);
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
    const rows = await d.getAllAsync<{ id: number; kind: string; dedupe: string; payload: string; created_at: number; attempts: number }>("SELECT * FROM outbox WHERE scope = ? ORDER BY id LIMIT ?", scope, limit);
    return rows.map((r) => ({ id: r.id, kind: r.kind, dedupe: r.dedupe, payload: JSON.parse(r.payload) as unknown, createdAt: r.created_at, attempts: r.attempts }));
  });
}

export async function discardOutbox(): Promise<void> {
  const scope = cacheScope();
  if (scope) await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM outbox WHERE scope = ?", scope)));
  await refreshOutboxCount();
}
