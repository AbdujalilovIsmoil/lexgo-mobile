import { asDict, asStr } from "@/shared/lib/json";
import { noteApiUnreachable } from "./NetworkMonitor";
import { netLog } from "./netLog";
import { probeApi, type Probe } from "./probe";
import { reachedWithin } from "./reach";
import { useNetStore } from "./netStore";

const TRY_MS = 10_000; // one probe: a first TLS handshake on a slow mobile link, or a probe queued behind a screen's requests, must fit
const EVERY_MS = 6_000; // probes start at most this often
const SILENT_MS = 25_000; // "server not answering" only after at least three probes and this long without any answer from the API

// The server's clock (the answer carries a naive UTC timestamp) minus the phone's, from a probe that went through.
function noteSkew(p: Probe, t0: number): void {
  let raw = "";
  try {
    raw = asStr(asDict(JSON.parse(p.text)).time);
  } catch {
    return;
  }
  const server = raw ? Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(raw) ? raw : `${raw}Z`) : NaN;
  if (Number.isFinite(server)) useNetStore.setState({ skewMs: Math.round(server - (t0 + p.ms / 2)) });
}

function up(): true {
  if (useNetStore.getState().serverDown) {
    netLog("health", "ok again");
    useNetStore.setState({ serverDown: false });
  }
  return true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// GET /health (public): tells a server that does not answer from a phone that just cannot send right now, and measures the clock skew.
// One check at a time. "Server down" needs three failed probes over at least 25 s with no other API answer meanwhile: a request that fails
// at once after a return from the background, during a switch between Wi-Fi and mobile data or behind a queue of a screen's requests is
// not a dead server (that verdict used to come after two quick failures 1.5 s apart, and the red pill flashed on a working connection).
let running: Promise<boolean> | null = null;
export function probeHealth(): Promise<boolean> {
  running ??= (async () => {
    const started = Date.now();
    const answered = () => reachedWithin(Date.now() - started + 1);
    try {
      for (let tries = 1; ; tries++) {
        const t0 = Date.now();
        const p = await probeApi(TRY_MS);
        if (p.ok && p.status < 500) {
          noteSkew(p, t0);
          return up();
        }
        netLog("health", `fail ${p.ms} ms: ${p.status ? `HTTP ${p.status}` : p.error}`);
        if (answered()) return up(); // real requests are being answered: the probe's own trouble
        if (tries >= 3 && Date.now() - started >= SILENT_MS) break;
        await sleep(Math.max(1000, t0 + EVERY_MS - Date.now()));
        if (answered()) return up();
      }
      if (await noteApiUnreachable("health")) return false; // the phone does not let LexGo use the network: not the server's fault
      if (useNetStore.getState().online && !useNetStore.getState().serverDown) {
        netLog("health", "server down");
        useNetStore.setState({ serverDown: true });
      }
      return false;
    } finally {
      running = null;
    }
  })();
  return running;
}
