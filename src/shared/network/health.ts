import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { noteApiUnreachable } from "./NetworkMonitor";
import { netLog } from "./netLog";
import { useNetStore } from "./netStore";

// GET /health (public): tells "no internet" from "server down" and measures the clock skew
// between the device and the backend (the response carries a naive UTC timestamp).
export async function probeHealth(): Promise<boolean> {
  const t0 = Date.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 5000);
  try {
    const d = asDict(await http("/health", { auth: false, signal: ctl.signal }));
    const raw = asStr(d.time);
    const server = raw ? Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(raw) ? raw : `${raw}Z`) : NaN;
    const rtt = Date.now() - t0;
    if (useNetStore.getState().serverDown) netLog("health", `ok again ${rtt} ms`);
    useNetStore.setState({ serverDown: false, ...(Number.isFinite(server) ? { skewMs: Math.round(server - (t0 + rtt / 2)) } : {}) });
    return true;
  } catch (e) {
    const why = e instanceof Error ? e.message : "error";
    netLog("health", `fail ${Date.now() - t0} ms: ${why}`);
    if (await noteApiUnreachable(why)) return false; // LexGo is blocked on this phone: not the server's fault
    useNetStore.setState({ serverDown: useNetStore.getState().online });
    return false;
  } finally {
    clearTimeout(timer);
  }
}
