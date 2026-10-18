import { asDict } from "@/shared/lib/json";
import type { SocketState } from "./types";
// `url` is evaluated on every attempt (a refreshed token is picked up); `pingMs` sends {"event":"ping"}.
type Opts = { url: () => string | null; onMessage: (data: unknown) => void; onState?: (s: SocketState) => void; onOpen?: (again: boolean) => void; pingMs?: number };
const LADDER = [1000, 2000, 4000, 8000, 16_000, 30_000];

// WebSocket with the TZ back-off ladder (1s, 2s, 4s, 8s, 16s, then 30s, plus jitter).
export class ReconnectingSocket {
  private ws: WebSocket | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  private ping?: ReturnType<typeof setInterval>;
  private retry = 0;
  private seen = false;
  private alive = false;
  constructor(private o: Opts) {}

  start() { this.alive = true; this.open(); }
  stop() {
    this.alive = false;
    clearTimeout(this.timer);
    clearInterval(this.ping);
    const w = this.ws;
    this.ws = null;
    if (w) { w.onclose = null; try { w.close(); } catch { /* already closed */ } }
    this.o.onState?.("offline");
  }
  /** Reconnect right now (app back in the foreground, network returned). */
  nudge() { if (this.alive && !this.ws) { clearTimeout(this.timer); this.retry = 0; this.open(); } }
  send(v: unknown): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    try { this.ws.send(JSON.stringify(v)); return true; } catch { return false; }
  }
  private schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.open(), LADDER[Math.min(this.retry++, LADDER.length - 1)] + Math.random() * 500);
  }
  private open() {
    const url = this.o.url();
    if (!url) return this.schedule();
    this.o.onState?.("connecting");
    let ws: WebSocket;
    try { ws = new WebSocket(url); } catch { return this.schedule(); }
    this.ws = ws;
    ws.onopen = () => {
      if (this.ws !== ws) return;
      const again = this.seen;
      this.seen = true;
      this.retry = 0;
      clearInterval(this.ping);
      if (this.o.pingMs) this.ping = setInterval(() => this.send({ event: "ping" }), this.o.pingMs);
      this.o.onState?.("online");
      this.o.onOpen?.(again);
    };
    ws.onmessage = (e) => {
      let data: unknown;
      try { data = JSON.parse(String(e.data)); } catch { return; }
      if (asDict(data).event !== "pong") this.o.onMessage(data);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      clearInterval(this.ping);
      this.o.onState?.("offline");
      if (this.alive) this.schedule();
    };
    ws.onerror = () => undefined; // onclose follows
  }
}
