import { ApiError, http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { Probe } from "@/shared/links";

export type Verdict = "open" | "closed" | "unknown";

// One cheap GET before a deep link opens (TZ 28/40: ownership and "resource closed" are checked on
// the server). 403/404/410 or a finished status = closed; a network or server failure proves nothing,
// so the screen opens anyway and shows its own error.
export async function probeTarget(p: Probe): Promise<Verdict> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 4000);
  try {
    const body = asDict(await http(p.path, { signal: ctl.signal }));
    return p.closed?.includes(asStr(body.status).toLowerCase()) ? "closed" : "open";
  } catch (e) {
    return e instanceof ApiError && (e.status === 403 || e.status === 404 || e.status === 410) ? "closed" : "unknown";
  } finally {
    clearTimeout(timer);
  }
}
