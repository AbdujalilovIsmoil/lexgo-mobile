import { create } from "zustand";
import { safely } from "./db";
import { cacheScope } from "./scope";

// How many offline writes wait for a connection (shown by the offline banner and the storage screen).
export const useOutboxStore = create<{ count: number; pending: readonly string[] }>(() => ({ count: 0, pending: [] }));
export const useQueueCount = (): number => useOutboxStore((s) => s.count);

// "kind|dedupe" of every waiting item: rows use it to show a "waiting to sync" mark on exactly their record.
export const pendingId = (kind: string, dedupe: string): string => `${kind}|${dedupe}`;
export const useIsPending = (kind: string, dedupe: string): boolean => useOutboxStore((s) => s.pending.includes(pendingId(kind, dedupe)));

export async function refreshOutboxCount(): Promise<number> {
  const scope = cacheScope();
  const rows = scope ? await safely<{ kind: string; dedupe: string }[]>([], (d) => d.getAllAsync("SELECT kind, dedupe FROM outbox WHERE scope = ? ORDER BY id", scope)) : [];
  useOutboxStore.setState({ count: rows.length, pending: rows.map((r) => pendingId(r.kind, r.dedupe)) });
  return rows.length;
}
