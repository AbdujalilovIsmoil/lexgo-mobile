import type { Query, QueryClient } from "@tanstack/react-query";
import { cacheList, cacheSet } from "./kv";
import { ruleFor } from "./persistRules";
import { cacheScope } from "./scope";

type Snapshot = { k: readonly unknown[]; d: unknown; t: number };
const PREFIX = "rq:";
const pending = new Map<string, ReturnType<typeof setTimeout>>();

// "rq:" + the query key as text: one row per query, replaced on every successful fetch.
const rowKey = (key: readonly unknown[]): string => PREFIX + JSON.stringify(key);

function snapshotData(q: Query, firstPageOnly: boolean): unknown {
  const data = q.state.data as { pages?: unknown[]; pageParams?: unknown[] } | undefined;
  if (firstPageOnly && data && Array.isArray(data.pages)) return { pages: data.pages.slice(0, 1), pageParams: (data.pageParams ?? []).slice(0, 1) };
  return data;
}

function save(q: Query): void {
  const rule = ruleFor(q.queryKey);
  if (!rule || !cacheScope() || q.state.status !== "success") return;
  const id = q.queryHash;
  clearTimeout(pending.get(id));
  pending.set(
    id,
    setTimeout(() => {
      pending.delete(id);
      void cacheSet(rowKey(q.queryKey), { k: q.queryKey, d: snapshotData(q, rule.firstPageOnly), t: q.state.dataUpdatedAt } satisfies Snapshot, rule.ttlMs);
    }, 1200),
  );
}

/** Writes allowed queries to SQLite after each successful fetch (debounced). Returns the unsubscribe. */
export function startPersisting(qc: QueryClient): () => void {
  return qc.getQueryCache().subscribe((e) => {
    if (e.type === "updated" && e.action.type === "success") save(e.query);
  });
}

/** Seeds the in-memory cache from disk for queries that have no data yet; fresh data always wins. */
export async function restoreQueries(qc: QueryClient): Promise<number> {
  const rows = await cacheList<Snapshot>(PREFIX);
  let n = 0;
  for (const { value } of rows) {
    if (!Array.isArray(value.k) || !ruleFor(value.k) || qc.getQueryData(value.k) !== undefined) continue;
    qc.setQueryData(value.k, value.d, { updatedAt: value.t });
    n += 1;
  }
  return n;
}
