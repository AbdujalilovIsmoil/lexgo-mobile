import { safely } from "./db";
import { cacheScope } from "./scope";
import { isSecretKey, serialize } from "./sanitize";

export const DAY = 86_400_000;
export type Row<T> = { key: string; value: T; updatedAt: number };

/** Stores a JSON value for the signed-in user. Secrets are stripped; a signed-out call is ignored. */
export async function cacheSet(key: string, value: unknown, ttlMs = 7 * DAY): Promise<void> {
  const scope = cacheScope();
  const text = scope && !isSecretKey(key) ? serialize(value) : null;
  if (!text) return;
  const now = Date.now();
  await safely(undefined, async (d) => {
    await d.runAsync("INSERT OR REPLACE INTO kv (scope, key, value, expires_at, updated_at) VALUES (?, ?, ?, ?, ?)", scope, key, text, now + ttlMs, now);
  });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const row = await cacheRow<T>(key);
  return row ? row.value : null;
}

export async function cacheRow<T>(key: string): Promise<Row<T> | null> {
  const scope = cacheScope();
  if (!scope) return null;
  return safely<Row<T> | null>(null, async (d) => {
    const r = await d.getFirstAsync<{ value: string; updated_at: number; expires_at: number }>("SELECT value, updated_at, expires_at FROM kv WHERE scope = ? AND key = ?", scope, key);
    if (!r) return null;
    if (r.expires_at < Date.now()) {
      await d.runAsync("DELETE FROM kv WHERE scope = ? AND key = ?", scope, key);
      return null;
    }
    return { key, value: JSON.parse(r.value) as T, updatedAt: r.updated_at };
  });
}

/** Every live row whose key starts with `prefix`, newest first. */
export async function cacheList<T>(prefix: string): Promise<Row<T>[]> {
  const scope = cacheScope();
  if (!scope) return [];
  return safely<Row<T>[]>([], async (d) => {
    const rows = await d.getAllAsync<{ key: string; value: string; updated_at: number }>("SELECT key, value, updated_at FROM kv WHERE scope = ? AND key LIKE ? AND expires_at >= ? ORDER BY updated_at DESC", scope, `${prefix}%`, Date.now());
    return rows.map((r) => ({ key: r.key, value: JSON.parse(r.value) as T, updatedAt: r.updated_at }));
  });
}

export async function cacheDelete(key: string): Promise<void> {
  const scope = cacheScope();
  if (scope) await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM kv WHERE scope = ? AND key = ?", scope, key)));
}
