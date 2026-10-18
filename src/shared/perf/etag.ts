// ETag / If-None-Match support for GET requests (TZ 39). The backend sends no ETag today
// (checked against /notifications, /subscription-plans, /health), so this stays inert until it does.
// Wiring in shared/api/http.ts run() — lead-owned, three lines:
//   headers = { ...headers, ...conditionalHeaders(key) }       // key = `${method} ${url}`
//   after the response: if (res.status === 304) body = cachedBody(key) else rememberEtag(key, res, text)
type Entry = { etag: string; body: string };
const store = new Map<string, Entry>();
const MAX_ENTRIES = 60;
const MAX_BYTES = 256_000;

export const conditionalHeaders = (key: string): Record<string, string> => {
  const e = store.get(key);
  return e ? { "If-None-Match": e.etag } : {};
};

export function rememberEtag(key: string, res: Pick<Response, "headers" | "ok">, body: string): void {
  const etag = res.headers.get("ETag");
  if (!res.ok || !etag || body.length > MAX_BYTES) return;
  store.delete(key);
  store.set(key, { etag, body });
  if (store.size > MAX_ENTRIES) store.delete(store.keys().next().value as string);
}

export const cachedBody = (key: string): string | undefined => store.get(key)?.body;
export const clearEtags = (): void => store.clear();
