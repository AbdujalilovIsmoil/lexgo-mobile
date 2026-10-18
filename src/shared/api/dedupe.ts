// Identical GETs started while one is still in flight share that single request (several screens asking for the same list).
const inflight = new Map<string, Promise<unknown>>();

export function shareGet<T>(path: string, init: { method?: string; body?: unknown; raw?: boolean; signal?: AbortSignal | null }, who: string, run: () => Promise<T>): Promise<T> {
  const get = (!init.method || init.method === "GET") && init.body === undefined && !init.raw && !init.signal;
  if (!get) return run();
  const key = `${who}|${path}`;
  const hit = inflight.get(key);
  if (hit) return hit as Promise<T>;
  const p = run().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
