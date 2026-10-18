import { useEffect, useRef } from "react";
import { subscribeUserEvents, onResync, useSocketStatus } from "./bus";
import type { UserEventHandler } from "./types";

// Subscribe to user-channel events while the component is mounted. `match` is an
// event name or a prefix ending in "." (e.g. "document_request.").
export function useUserEvents(match: string | string[], handler: UserEventHandler): void {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  const key = Array.isArray(match) ? match.join("|") : match;
  useEffect(() => {
    const list = key.split("|");
    return subscribeUserEvents((e) => {
      if (list.some((m) => (m.endsWith(".") ? e.event.startsWith(m) : e.event === m))) ref.current(e);
    });
  }, [key]);
}

// Run `fn` (usually a query refetch) after every socket reconnect.
export function useResync(fn: () => void): void {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => onResync(() => ref.current()), []);
}

export const useSocketState = () => useSocketStatus((s) => s.state);
