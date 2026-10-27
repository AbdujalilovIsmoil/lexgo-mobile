import { API_BASE } from "@/shared/config/env";

// status: the HTTP status of the answer (0 = none); text: its body (the health check reads the server's clock from it).
export type Probe = { ok: boolean; error: string; ms: number; status: number; text: string };

// One GET /health without the http layer (no auth, no retries). Any HTTP answer (even a 404 / 500) proves the API can be reached.
// XMLHttpRequest instead of fetch: on failure React Native leaves the OS's own error text in responseText ("The Internet connection
// appears to be offline.", "A server with the specified hostname could not be found.", …), fetch replaces it with "Network request failed".
export function probeApi(timeoutMs: number): Promise<Probe> {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    let done = false;
    const finish = (ok: boolean, error = "", status = 0, text = "") => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ok, error: error.slice(0, 200), ms: Date.now() - t0, status, text });
    };
    const timer = setTimeout(() => {
      finish(false, `timeout ${timeoutMs} ms`);
      try { xhr.abort(); } catch { /* already finished */ }
    }, timeoutMs);
    xhr.onload = () => {
      let text = "";
      try { text = String(xhr.responseText || "").slice(0, 2000); } catch { /* not readable */ }
      finish(true, "", Number(xhr.status) || 0, text);
    };
    xhr.onerror = () => {
      let text = "";
      try { text = String(xhr.responseText || ""); } catch { /* not readable */ }
      finish(false, text || "network error");
    };
    xhr.ontimeout = () => finish(false, `timeout ${timeoutMs} ms`);
    try {
      xhr.open("GET", `${API_BASE}/health?probe=1`);
      xhr.send();
    } catch (e) {
      finish(false, e instanceof Error ? e.message : "send failed");
    }
  });
}
