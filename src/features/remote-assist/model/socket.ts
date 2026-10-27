import { accessToken } from "@/shared/api";
import { WS_BASE } from "@/shared/config/env";
import { asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { ReconnectingSocket } from "@/shared/realtime";

export type RaFrame = { event: string; data: Dict; raw: Dict };
export type Check = "open" | "stop" | "retry";

/** One server frame: {event|type, payload|data}. `data` is the payload when there is one, else the frame itself; pong is dropped. */
export function frameOf(v: unknown): RaFrame | null {
  const raw = asDict(v);
  const event = asStr(raw.event ?? raw.type);
  if (!event || event === "pong") return null;
  const p = asDict(raw.payload ?? raw.data);
  return { event, data: Object.keys(p).length ? p : raw, raw };
}

const LADDER = [1000, 2000, 4000, 8000, 16_000, 30_000];
type Handlers = { onFrame: (f: RaFrame) => void; onOpen: (again: boolean) => void; check: () => Promise<Check> };

// /ws/remote-assistance/{id}?token=… (TZ RA §12). The token is read on every attempt and the URL is never logged; a ping goes every 25 s
// while it is open. A dropped socket is not simply reopened: `check` reads the session first and only a live one reconnects (the §12
// reconnect order); onOpen(true) then reads the command history and publishes a newer state.
export function createRaSocket(id: string, h: Handlers) {
  let wanted = false;
  let checking = false; // closed on purpose, waiting for (or running) the session check
  let running = false;
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const sock: ReconnectingSocket = new ReconnectingSocket({
    url: () => {
      const token = accessToken();
      return token ? `${WS_BASE}/ws/remote-assistance/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}` : null;
    },
    pingMs: 25_000,
    onOpen: (again) => {
      attempt = 0;
      h.onOpen(again);
    },
    onState: (s) => {
      if (s === "offline" && wanted && !checking) closeAndCheck(true);
    },
    onMessage: (d) => {
      const f = frameOf(d);
      // An expired token is answered with an error frame: the check's authorised GET refreshes it, then the socket reopens.
      if (f?.event === "error" && asNum(f.raw.status_code ?? f.data.status_code) === 401) return closeAndCheck(true);
      if (f) h.onFrame(f);
    },
  });
  const run = async () => {
    if (running || !wanted) return;
    running = true;
    const r = await h.check().catch((): Check => "retry");
    running = false;
    if (!wanted) return;
    if (r === "retry") return schedule();
    checking = false;
    if (r === "open") sock.start();
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void run(), LADDER[Math.min(attempt++, LADDER.length - 1)] + Math.random() * 400);
  };
  function closeAndCheck(soon: boolean) {
    checking = true;
    sock.stop();
    clearTimeout(timer);
    if (soon) schedule();
  }
  return {
    start(): void {
      wanted = true;
      sock.start();
    },
    stop(): void {
      wanted = false;
      checking = false;
      clearTimeout(timer);
      sock.stop();
    },
    send: (v: unknown): boolean => sock.send(v),
    /** Closed while the app is away; `wake` checks the session and reconnects. */
    sleep: (): void => {
      if (wanted && !checking) closeAndCheck(false);
    },
    /** The app is in front again / the network is back: check now instead of after the back-off. */
    wake: (): void => {
      if (!wanted) return;
      if (!checking) return sock.nudge();
      clearTimeout(timer);
      attempt = 0;
      void run();
    },
    resyncing: (): boolean => checking,
  };
}

export type RaSocket = ReturnType<typeof createRaSocket>;
