import type { Query, QueryClient } from "@tanstack/react-query";
import { yieldToUi } from "@/shared/lib/yieldWork";
import { cacheKeys, cacheSet, cacheTexts, cacheUpdatedAt } from "./kv";
import { ruleFor } from "./persistRules";
import { planRestore } from "./restorePlan";
import { cacheEpoch, cacheScope, sameCacheEpoch } from "./scope";
import { CACHE_VERSION } from "./version";

type Snapshot = { k: readonly unknown[]; d: unknown; t: number; v?: string };
const PREFIX = "rq:";
const pending = new Map<string, ReturnType<typeof setTimeout>>();
// Data read back from disk → its saved time. Writing exactly that back would only cost time at start; a refetch that
// returns equal data keeps the same object (structural sharing) but a newer time, and is saved again.
const restored = new WeakMap<object, number>();

// "rq:" + the query key as text: one row per query, replaced on every successful fetch.
const rowKey = (key: readonly unknown[]): string => PREFIX + JSON.stringify(key);

function snapshotData(q: Query, firstPageOnly: boolean): unknown {
  const data = q.state.data as { pages?: unknown[]; pageParams?: unknown[] } | undefined;
  if (firstPageOnly && data && Array.isArray(data.pages)) return { pages: data.pages.slice(0, 1), pageParams: (data.pageParams ?? []).slice(0, 1) };
  return data;
}

/** When the query's snapshot was last written (0: none) — by a screen's fetch or the background job. */
export const snapshotSavedAt = (key: readonly unknown[]): Promise<number> => cacheUpdatedAt(rowKey(key));

/** Writes one snapshot immediately (used by the background job, which has no QueryClient to subscribe to). */
export async function saveSnapshot(key: readonly unknown[], data: unknown, updatedAt = Date.now()): Promise<void> {
  const rule = ruleFor(key);
  if (rule && cacheScope()) await cacheSet(rowKey(key), { k: key, d: data, t: updatedAt, v: CACHE_VERSION } satisfies Snapshot, rule.ttlMs);
}

function save(q: Query): void {
  const rule = ruleFor(q.queryKey);
  const scope = cacheScope();
  if (!rule || !scope || q.state.status !== "success") return;
  const data = q.state.data;
  if (typeof data === "object" && data !== null && restored.get(data) === q.state.dataUpdatedAt) return;
  const at = cacheEpoch();
  const id = q.queryHash;
  clearTimeout(pending.get(id));
  pending.set(
    id,
    setTimeout(() => {
      pending.delete(id);
      // Signed out, another account or another role since the fetch: this data belongs to nobody who is here now.
      if (!sameCacheEpoch(scope, at)) return;
      void cacheSet(rowKey(q.queryKey), { k: q.queryKey, d: snapshotData(q, rule.firstPageOnly), t: q.state.dataUpdatedAt, v: CACHE_VERSION } satisfies Snapshot, rule.ttlMs);
    }, 1200),
  );
}

/** Drops the snapshot writes still waiting for their debounce (the cache is being wiped). */
export function cancelPendingSaves(): void {
  for (const t of pending.values()) clearTimeout(t);
  pending.clear();
}

/** Writes allowed queries to SQLite after each successful fetch (debounced). Returns the unsubscribe. */
export function startPersisting(qc: QueryClient): () => void {
  return qc.getQueryCache().subscribe((e) => {
    if (e.type === "updated" && e.action.type === "success") save(e.query);
  });
}

let restoring: Promise<void> = Promise.resolve();
/** Resolves once the start-up restore finished (at once when none runs): "no data yet" means "none saved" only after it. */
export const whenRestored = (): Promise<void> => restoring;

/**
 * Seeds the in-memory cache from disk for queries that have no data yet; fresh data always wins. Only keys are listed
 * first; values are read and parsed a few at a time with a yield to the UI between slices, newest first and within
 * a size budget, so a big cache never freezes the first screens (one JS thread on Android). Stops at once when the
 * user, role or cache changes meanwhile, so nothing of the previous account reaches the in-memory cache.
 */
export function restoreQueries(qc: QueryClient): Promise<number> {
  const job = restoreSlices(qc);
  restoring = job.then(
    () => undefined,
    () => undefined,
  );
  return job;
}

async function restoreSlices(qc: QueryClient): Promise<number> {
  const scope = cacheScope();
  const at = cacheEpoch();
  if (!scope) return 0;
  const slices = planRestore(await cacheKeys(PREFIX), PREFIX, (k) => qc.getQueryData(k) !== undefined);
  let n = 0;
  for (const slice of slices) {
    if (!sameCacheEpoch(scope, at)) break;
    const texts = await cacheTexts(slice.map((x) => x.row));
    if (!sameCacheEpoch(scope, at)) break;
    for (const item of slice) {
      const text = texts.get(item.row);
      if (!text || qc.getQueryData(item.key) !== undefined) continue;
      let snap: Snapshot;
      try {
        snap = JSON.parse(text) as Snapshot;
      } catch {
        continue;
      }
      if (snap.v !== CACHE_VERSION || snap.d === undefined) continue;
      if (typeof snap.d === "object" && snap.d !== null) restored.set(snap.d, snap.t);
      qc.setQueryData(item.key, snap.d, { updatedAt: snap.t });
      n += 1;
    }
    await yieldToUi();
  }
  return n;
}
