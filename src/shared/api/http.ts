import { API_BASE } from "@/shared/config/env";
import { ApiError, parseErrorBody } from "./errors";
import { baseHeaders } from "./headers";
import { shareGet } from "./dedupe";
import { timed } from "./roundTrip";
import { demoAnswer } from "../demo/mocks";
import { demoOn } from "../demo/demoStore";

// Token access is injected by the session entity so this layer stays
// framework-free (same split as lib/client.ts + lib/http.ts on the web).
type TokenSource = () => string | null;
type Refresher = () => Promise<string | null>;
let getToken: TokenSource = () => null;
let refresh: Refresher | null = null;
let refreshing: Promise<string | null> | null = null;

export function bindAuth(source: TokenSource, refresher: Refresher | null): void {
  getToken = source;
  refresh = refresher;
}

// Current access token, for requests made outside `http` (authed file downloads).
export const accessToken = (): string | null => getToken();

export type HttpInit = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean; raw?: boolean };

async function run(path: string, init: HttpInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { ...baseHeaders(), ...(init.headers as Record<string, string>) };
  let body: BodyInit | undefined;
  if (init.body !== undefined) {
    body = typeof init.body === "string" || init.body instanceof FormData ? (init.body as BodyInit) : JSON.stringify(init.body);
    if (!(init.body instanceof FormData)) headers["Content-Type"] = "application/json";
  }
  if (token && init.auth !== false) headers.Authorization = `Bearer ${token}`;
  if (typeof __DEV__ !== "undefined" && __DEV__) console.log(`[api] ${init.method ?? "GET"} ${path}`); // dev only: the request log shows duplicates
  try {
    return await timed(() => fetch(`${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`, { ...init, headers, body }), !(init.body instanceof FormData));
  } catch {
    throw new ApiError(0, "network_error");
  }
}

async function refreshOnce(): Promise<string | null> {
  if (!refresh) return null;
  if (!refreshing) refreshing = refresh().finally(() => (refreshing = null));
  return refreshing;
}

// With the Demo switch on, a plain GET of a path that has demo data is answered locally (the server is not asked at all).
const demoed = (path: string, init: HttpInit): unknown => (demoOn() && (!init.method || init.method === "GET") ? demoAnswer(path) : undefined);

export const http = <T = unknown>(path: string, init: HttpInit = {}): Promise<T> => { const d = demoed(path, init); return d !== undefined ? Promise.resolve(d as T) : shareGet(path, init, getToken() ?? "", () => send<T>(path, init)); };

// A request with bearer auth and one transparent token refresh on 401; the body comes back as text.
async function sendText(path: string, init: HttpInit): Promise<string> {
  let res = await run(path, init, getToken());
  if (res.status === 401 && init.auth !== false && getToken()) {
    const fresh = await refreshOnce();
    if (fresh) res = await run(path, init, fresh);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw parseErrorBody(res.status, body, res.headers.get("Retry-After"));
  }
  return res.status === 204 ? "" : await res.text();
}

// JSON request with bearer auth and one transparent token refresh on 401.
async function send<T>(path: string, init: HttpInit): Promise<T> {
  const text = await sendText(path, init);
  return (text ? JSON.parse(text) : undefined) as T;
}

// The same request, answered as raw text and NOT parsed: for a huge JSON (the template catalogue, ≈9 MB) whose parsing the caller moves off the
// JS thread — parsing it here froze every touch for a second or more.
export const httpText = (path: string, init: HttpInit = {}): Promise<string> => shareGet(path, { ...init, raw: false }, `${getToken() ?? ""}|text`, () => sendText(path, init));

// Raw variant for endpoints that use non-2xx statuses as data (login 428).
export async function httpRaw(path: string, init: HttpInit = {}): Promise<{ status: number; body: unknown }> {
  const res = await run(path, init, getToken());
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}
