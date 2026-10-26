import { setSocketState } from "./bus";
import { conn, drop } from "./conn";
import { PING_MS } from "./frames";
import { openSocket, reconnectNow } from "./userSocket";

export function disconnectUserSocket(): void {
  conn.token = "";
  conn.everOnline = false;
  drop();
  setSocketState("offline");
}

// A new token (refresh) replaces the connection; no token closes it. A token refresh while the socket is alive is not a reconnect:
// the screens are not all re-read for it (only a socket that was down or silent may have missed events).
export function connectUserSocket(tok: string): void {
  if (!tok) return disconnectUserSocket();
  if (tok === conn.token && conn.ws) return;
  const live = !!conn.token && conn.ws?.readyState === WebSocket.OPEN && Date.now() - conn.lastRx < PING_MS * 1.5;
  conn.swapAt = live ? Date.now() : 0;
  conn.token = tok;
  conn.attempt = 0;
  drop();
  openSocket();
}

// App came back to the foreground or the network returned: reconnect now.
// A socket that is still "open" after the phone slept may be dead: it is replaced when it has been silent for a ping cycle.
export function kickUserSocket(): void {
  if (!conn.token) return;
  const quiet = Date.now() - conn.lastRx > PING_MS * 1.5;
  if (!conn.ws || conn.ws.readyState !== WebSocket.OPEN || quiet) return reconnectNow();
  conn.ws.send(JSON.stringify({ event: "ping" }));
}
