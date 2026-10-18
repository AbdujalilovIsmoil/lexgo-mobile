import { File } from "expo-file-system";
import { safely, dbFile } from "./db";
import { useOutboxStore } from "./outboxStore";
import { cacheScope } from "./scope";

/** Deletes the rows of one user (default: the signed-in one) from the cache and the outbox. */
export async function wipeScope(scope = cacheScope()): Promise<void> {
  if (!scope) return;
  await safely(undefined, async (d) => {
    await d.runAsync("DELETE FROM kv WHERE scope = ?", scope);
    await d.runAsync("DELETE FROM outbox WHERE scope = ?", scope);
  });
}

/** Empties the cache and the outbox for every user (sign-out / user change: nothing may leak to the next account). */
export async function wipeAll(): Promise<void> {
  await safely(undefined, async (d) => {
    await d.runAsync("DELETE FROM kv");
    await d.runAsync("DELETE FROM outbox");
  });
  useOutboxStore.setState({ count: 0 });
}

/** Deletes cached documents only (query snapshots, drafts, file metadata); queued writes stay. */
export async function clearCachedData(): Promise<void> {
  const scope = cacheScope();
  if (scope) await safely(undefined, async (d) => void (await d.runAsync("DELETE FROM kv WHERE scope = ?", scope)));
}

export async function pruneExpired(): Promise<void> {
  await safely(undefined, async (d) => {
    await d.runAsync("DELETE FROM kv WHERE expires_at < ?", Date.now());
    await d.runAsync("DELETE FROM outbox WHERE created_at < ?", Date.now() - 3 * 86_400_000);
  });
}

export type CacheStats = { rows: number; bytes: number; dbBytes: number };

export async function cacheStats(): Promise<CacheStats> {
  const scope = cacheScope();
  const sums = await safely({ n: 0, b: 0 }, async (d) => {
    const r = await d.getFirstAsync<{ n: number; b: number | null }>("SELECT COUNT(*) AS n, SUM(LENGTH(value)) AS b FROM kv WHERE scope = ?", scope);
    return { n: r?.n ?? 0, b: r?.b ?? 0 };
  });
  let dbBytes = 0;
  try {
    dbBytes = new File(dbFile()).size ?? 0;
  } catch {
    /* the file may not exist yet */
  }
  return { rows: sums.n, bytes: sums.b, dbBytes };
}
