import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";

// Dev builds only (index.ts requires this file behind __DEV__, so it is not in release bundles). Sends console.* logs, network
// requests, global errors and AsyncStorage changes to the Reactotron desktop app on port 9090.
// The host is taken from the bundle URL, so the iOS simulator, a real phone on the same Wi-Fi and the Android emulator all find the Mac.
// If the Android emulator still does not connect: `adb reverse tcp:9090 tcp:9090`.
Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({ name: "LexGo" })
  .useReactNative({
    asyncStorage: true,
    errors: true,
    log: true, // console.log / warn / error / debug -> Reactotron timeline
    networking: { ignoreUrls: /symbolicate|logs|generate_204|127\.0\.0\.1:8081|localhost:8081|__host_clipboard/ },
    editor: false,
    overlay: false,
  })
  .connect();

// Wipe the timeline on every reload, so each run starts clean.
Reactotron.clear?.();

// Expo SDK 52+ replaces the global `fetch` with its native `expo/fetch`, which does not go through XMLHttpRequest — so the
// `networking` option above never sees our API calls. Wrap `fetch` here and report each call as an API RESPONSE entry
// (method, url, request headers/body, status, response headers/body, duration). The winter runtime installs `expo/fetch`
// before the entry file runs, so `globalThis.fetch` is already the Expo one at this point.
const IGNORE = /symbolicate|generate_204|127\.0\.0\.1:8081|localhost:8081|__host_clipboard/;
const MAX_BODY = 200_000; // the ≈9 MB template catalogue would freeze the Reactotron timeline

const headersToObject = (h: HeadersInit | Headers | undefined): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!h) return out;
  new Headers(h as HeadersInit).forEach((v, k) => (out[k] = v));
  return out;
};

const parseMaybeJson = (text: string): unknown => {
  if (text.length > MAX_BODY) return `${text.slice(0, MAX_BODY)}… [truncated, ${text.length} chars]`;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const describeBody = (body: unknown): unknown => {
  if (body == null) return undefined;
  if (typeof body === "string") return parseMaybeJson(body);
  if (body instanceof FormData) return "[FormData]";
  return `[${(body as object).constructor?.name ?? typeof body}]`;
};

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (IGNORE.test(url)) return originalFetch(input, init);
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const request = {
    url,
    method,
    headers: headersToObject(init?.headers ?? (input instanceof Request ? input.headers : undefined)),
    data: describeBody(init?.body),
    params: null,
  };
  const t0 = Date.now();
  try {
    const res = await originalFetch(input, init);
    // Read a clone so the caller still gets an unread body.
    res
      .clone()
      .text()
      .then(
        (text) => Reactotron.apiResponse?.(request, { status: res.status, headers: headersToObject(res.headers), body: parseMaybeJson(text) as string }, Date.now() - t0),
        () => Reactotron.apiResponse?.(request, { status: res.status, headers: headersToObject(res.headers), body: "[unreadable body]" }, Date.now() - t0),
      );
    return res;
  } catch (e) {
    Reactotron.apiResponse?.(request, { status: 0, headers: {}, body: `[network error] ${String(e)}` }, Date.now() - t0);
    throw e;
  }
};

export default Reactotron;
