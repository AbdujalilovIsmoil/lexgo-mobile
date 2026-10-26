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

/** When the row was last written (0: none), without reading its value. */
export async function cacheUpdatedAt(key: string): Promise<number> {
  const scope = cacheScope();
  if (!scope) return 0;
  return safely(0, async (d) => (await d.getFirstAsync<{ updated_at: number }>("SELECT updated_at FROM kv WHERE scope = ? AND key = ? AND expires_at > ?", scope, key, Date.now()))?.updated_at ?? 0);
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

/** Key, stored size and age of every live row under `prefix`, newest first. No value is read or parsed. */
export async function cacheKeys(prefix: string): Promise<{ key: string; bytes: number; updatedAt: number }[]> {
  const scope = cacheScope();
  if (!scope) return [];
  return safely<{ key: string; bytes: number; updatedAt: number }[]>([], async (d) => {
    const rows = await d.getAllAsync<{ key: string; n: number; updated_at: number }>("SELECT key, LENGTH(value) AS n, updated_at FROM kv WHERE scope = ? AND key LIKE ? AND expires_at >= ? ORDER BY updated_at DESC", scope, `${prefix}%`, Date.now());
    return rows.map((r) => ({ key: r.key, bytes: r.n, updatedAt: r.updated_at }));
  });
}

/** Raw JSON text of a few rows (the caller parses them in slices, between yields to the UI). */
export async function cacheTexts(keys: readonly string[]): Promise<Map<string, string>> {
  const scope = cacheScope();
  if (!scope || !keys.length) return new Map();
  return safely(new Map<string, string>(), async (d) => {
    const rows = await d.getAllAsync<{ key: string; value: string }>(`SELECT key, value FROM kv WHERE scope = ? AND key IN (${keys.map(() => "?").join(", ")})`, scope, ...keys);
    return new Map(rows.map((r) => [r.key, r.value]));
  });
}

export async function cacheDelete(key: string): Promise<void> {
  const scope = cacheScope();
  if (scope) await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM kv WHERE scope = ? AND key = ?", scope, key)));
}
