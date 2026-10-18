import { create } from "zustand";
import type { SocketState, UserEvent, UserEventHandler } from "./types";

const handlers = new Set<UserEventHandler>();
const resync = new Set<() => void>();
const seen = new Map<string, number>();

export const useSocketStatus = create<{ state: SocketState }>(() => ({ state: "offline" }));
export const setSocketState = (state: SocketState) => useSocketStatus.setState({ state });

// Events with an id are delivered once even if the server repeats them after a reconnect.
function duplicate(e: UserEvent): boolean {
  const id = typeof e.id === "string" ? e.id : typeof e.event_id === "string" ? e.event_id : "";
  if (!id) return false;
  const key = `${e.event}:${id}`;
  if (seen.has(key)) return true;
  seen.set(key, Date.now());
  if (seen.size > 300) for (const k of [...seen.keys()].slice(0, 100)) seen.delete(k);
  return false;
}

export function emit(e: UserEvent): void {
  if (duplicate(e)) return;
  for (const h of handlers) {
    try {
      h(e);
    } catch {
      /* one bad handler must not stop the others */
    }
  }
}

export function subscribeUserEvents(h: UserEventHandler): () => void {
  handlers.add(h);
  return () => void handlers.delete(h);
}

// Runs after every RE-connect: the events missed while offline are gone, so
// screens re-read their REST state once (TZ 37.6: "reconnectdan keyin REST sync").
export function onResync(h: () => void): () => void {
  resync.add(h);
  return () => void resync.delete(h);
}
export const runResync = () => resync.forEach((h) => h());
