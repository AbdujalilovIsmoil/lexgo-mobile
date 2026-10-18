import { create } from "zustand";
import { safely } from "./db";
import { cacheScope } from "./scope";

// How many offline writes wait for a connection (shown by the offline banner and the storage screen).
export const useOutboxStore = create<{ count: number }>(() => ({ count: 0 }));
export const useQueueCount = (): number => useOutboxStore((s) => s.count);

export async function refreshOutboxCount(): Promise<number> {
  const scope = cacheScope();
  const count = scope ? await safely(0, async (d) => (await d.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM outbox WHERE scope = ?", scope))?.n ?? 0) : 0;
  useOutboxStore.setState({ count });
  return count;
}
