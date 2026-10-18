import { WS_BASE } from "@/shared/config/env";
import { runResync, setSocketState } from "./bus";
import { conn, drop } from "./conn";
import { backoff, onFrame, PING_MS } from "./frames";

function schedule(): void {
  clearTimeout(conn.retry);
  if (!conn.token) return;
  conn.retry = setTimeout(() => {
    conn.attempt += 1;
    openSocket();
  }, backoff(conn.attempt));
}

/** Throw the current socket away and open a fresh one now. */
export function reconnectNow(): void {
  if (!conn.token) return;
  conn.attempt = 0;
  drop();
  openSocket();
}

export function openSocket(): void {
  if (!conn.token || (conn.ws && conn.ws.readyState <= WebSocket.OPEN)) return;
  setSocketState("connecting");
  const sock = new WebSocket(`${WS_BASE}/ws/users/me?token=${encodeURIComponent(conn.token)}`);
  conn.ws = sock;
  sock.onopen = () => {
    if (conn.ws !== sock) return;
    const again = conn.everOnline;
    conn.everOnline = true;
    conn.attempt = 0;
    setSocketState("online");
    conn.lastRx = Date.now();
    conn.pongs = false;
    clearInterval(conn.ping);
    conn.ping = setInterval(() => {
      // A phone that slept or lost wifi keeps a socket that looks open but is dead: no answer for two pings means reconnect.
      if (conn.pongs && Date.now() - conn.lastRx > PING_MS * 2 + 5000) return reconnectNow();
      if (sock.readyState === WebSocket.OPEN) sock.send(JSON.stringify({ event: "ping" }));
    }, PING_MS);
    if (again) runResync();
  };
  sock.onmessage = (m) => {
    conn.lastRx = Date.now();
    if (String(m.data).includes('"pong"')) conn.pongs = true;
    onFrame(m.data);
  };
  sock.onclose = () => {
    if (conn.ws !== sock) return;
    conn.ws = null;
    clearInterval(conn.ping);
    setSocketState("offline");
    schedule();
  };
  sock.onerror = () => {};
}
