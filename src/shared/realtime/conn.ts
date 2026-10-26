// Mutable state of the single user-channel connection (one socket per app).
export const conn: {
  ws: WebSocket | null;
  token: string;
  attempt: number;
  everOnline: boolean;
  lastRx: number; // when any frame (pong included) last arrived
  pongs: boolean; // the server has answered a ping at least once, so silence can be trusted as a dead link
  swapAt: number; // when a live socket was replaced only for a new token: its successor has missed nothing and re-reads nothing
  retry?: ReturnType<typeof setTimeout>;
  ping?: ReturnType<typeof setInterval>;
} = { ws: null, token: "", attempt: 0, everOnline: false, lastRx: 0, pongs: false, swapAt: 0 };

// Close the current socket and stop its timers (a replacement may follow).
export function drop(): void {
  clearTimeout(conn.retry);
  clearInterval(conn.ping);
  const old = conn.ws;
  conn.ws = null;
  old?.close();
}
